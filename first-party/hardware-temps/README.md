CPU and GPU temperatures, read from [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) running on the same PC.

ShiftPane's own `temperatures` source will cover GPUs through their vendors' APIs, but reading a CPU's temperature on Windows takes a kernel driver, which ShiftPane doesn't ship. LibreHardwareMonitor does, and it can share what it reads over a small local web server. This widget reads that.

## Setup

1. Install and run LibreHardwareMonitor.
2. Turn on **Options → Remote Web Server → Run**. It listens on port 8085.
3. Install this widget and allow it to reach `127.0.0.1:8085` when ShiftPane asks.

## Permissions

- **Can reach 127.0.0.1:8085 on your PC,** and nothing else. Talking to an app on your PC always asks first, and the address has to match exactly.
