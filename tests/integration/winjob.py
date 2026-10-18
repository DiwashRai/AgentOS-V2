"""A Windows job object that kills every process in it when it is closed, so a test owns the
whole tree it starts, even through a parent that has exited.

The job is assigned just after spawn, so a child started before that escapes it. The venv's
`python.exe` is a launcher that starts the real interpreter as a child at once; tests are safe
today only because CPython's launcher puts that child in a kill-on-close job of its own. The
product's process boundary (plan step 8) must start processes suspended and assign them before
they run, or launch the base interpreter, rather than copy this race."""

import sys

if sys.platform == "win32":
    import ctypes
    from ctypes import wintypes

    _JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000
    _JOB_OBJECT_EXTENDED_LIMIT_INFORMATION = 9
    _PROCESS_SET_QUOTA = 0x0100
    _PROCESS_TERMINATE = 0x0001

    class _IoCounters(ctypes.Structure):
        _fields_ = [(name, ctypes.c_ulonglong) for name in ("r", "w", "o", "rb", "wb", "ob")]

    class _BasicLimits(ctypes.Structure):
        _fields_ = [
            ("PerProcessUserTimeLimit", ctypes.c_int64),
            ("PerJobUserTimeLimit", ctypes.c_int64),
            ("LimitFlags", wintypes.DWORD),
            ("MinimumWorkingSetSize", ctypes.c_size_t),
            ("MaximumWorkingSetSize", ctypes.c_size_t),
            ("ActiveProcessLimit", wintypes.DWORD),
            ("Affinity", ctypes.c_size_t),
            ("PriorityClass", wintypes.DWORD),
            ("SchedulingClass", wintypes.DWORD),
        ]

    class _ExtendedLimits(ctypes.Structure):
        _fields_ = [
            ("BasicLimitInformation", _BasicLimits),
            ("IoInfo", _IoCounters),
            ("ProcessMemoryLimit", ctypes.c_size_t),
            ("JobMemoryLimit", ctypes.c_size_t),
            ("PeakProcessMemoryUsed", ctypes.c_size_t),
            ("PeakJobMemoryUsed", ctypes.c_size_t),
        ]

    _kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    _kernel32.CreateJobObjectW.restype = wintypes.HANDLE
    _kernel32.CreateJobObjectW.argtypes = [wintypes.LPVOID, wintypes.LPCWSTR]
    _kernel32.SetInformationJobObject.argtypes = [
        wintypes.HANDLE,
        ctypes.c_int,
        wintypes.LPVOID,
        wintypes.DWORD,
    ]
    _kernel32.OpenProcess.restype = wintypes.HANDLE
    _kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    _kernel32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    _kernel32.CloseHandle.argtypes = [wintypes.HANDLE]

    def _check(ok: object) -> None:
        if not ok:
            raise ctypes.WinError(ctypes.get_last_error())

    def kill_on_close_job(pid: int) -> int:
        """A new kill-on-close job holding process `pid`; close it with `close_job`. If a step
        fails, every handle acquired so far is closed and the error goes on."""
        job = _kernel32.CreateJobObjectW(None, None)
        _check(job)
        try:
            limits = _ExtendedLimits()
            limits.BasicLimitInformation.LimitFlags = _JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
            size = ctypes.sizeof(limits)
            info = _JOB_OBJECT_EXTENDED_LIMIT_INFORMATION
            _check(_kernel32.SetInformationJobObject(job, info, ctypes.byref(limits), size))
            process = _kernel32.OpenProcess(_PROCESS_SET_QUOTA | _PROCESS_TERMINATE, False, pid)
            _check(process)
            try:
                _check(_kernel32.AssignProcessToJobObject(job, process))
            finally:
                _kernel32.CloseHandle(process)
        except BaseException:
            _kernel32.CloseHandle(job)
            raise
        handle: int = job
        return handle

    def close_job(job: int) -> None:
        """Closes the job: every process still in it is killed."""
        _check(_kernel32.CloseHandle(job))
