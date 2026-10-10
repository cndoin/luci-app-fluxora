# Security

Do not open a public issue containing credentials, session cookies or exploitable private details. Use GitHub's private vulnerability reporting when available.

Fluxora executes only two fixed, ACL-authorized read operations (`status` and `live`). Interface names are validated and are never evaluated as shell code. Configuration writes use LuCI/UCI. The dashboard uses local assets and does not transmit traffic history to an external service.

Administrators can change the selected device and data settings. This is an authenticated router administration tool; it should be protected by the same access controls as LuCI.
