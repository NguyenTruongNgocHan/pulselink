#!/usr/bin/env python3
"""Authenticated PulseLink acceptance smoke test using only Python stdlib."""

from __future__ import annotations

import json
import os
import sys
import time
import uuid
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API_URL = os.environ.get("API_URL", "http://localhost:8080").rstrip("/")
PASSWORD = os.environ.get("PULSELINK_DEMO_PASSWORD", "password")


class SmokeFailure(RuntimeError):
    pass


@dataclass(frozen=True)
class Session:
    email: str
    token: str
    user_id: str


def request(
    method: str,
    path: str,
    *,
    token: str | None = None,
    body: Any | None = None,
    content_type: str = "application/json",
    expected: tuple[int, ...] = (200,),
) -> tuple[int, Any, bytes]:
    headers = {"Accept": "application/json"}
    payload: bytes | None = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        if content_type == "application/json":
            payload = json.dumps(body).encode("utf-8")
        elif isinstance(body, bytes):
            payload = body
        else:
            raise TypeError("Non-JSON bodies must be bytes")
        headers["Content-Type"] = content_type

    req = Request(f"{API_URL}{path}", data=payload, headers=headers, method=method)
    try:
        with urlopen(req, timeout=20) as response:
            raw = response.read()
            status = response.status
            response_type = response.headers.get("Content-Type", "")
    except HTTPError as error:
        raw = error.read()
        status = error.code
        response_type = error.headers.get("Content-Type", "")
    except URLError as error:
        raise SmokeFailure(f"Unable to reach {API_URL}{path}: {error}") from error

    if status not in expected:
        message = raw.decode("utf-8", errors="replace")
        raise SmokeFailure(
            f"{method} {path} returned {status}; expected {expected}: {message}"
        )

    parsed: Any = None
    if raw and "json" in response_type:
        parsed = json.loads(raw.decode("utf-8"))
    return status, parsed, raw


def login(email: str) -> Session:
    _, data, _ = request(
        "POST",
        "/api/v1/auth/login",
        body={"email": email, "password": PASSWORD},
    )
    if not isinstance(data, dict):
        raise SmokeFailure(f"Login response for {email} was not JSON")
    token = str(data.get("accessToken") or "")
    user = data.get("user") or {}
    user_id = str(user.get("id") or "")
    if not token or not user_id:
        raise SmokeFailure(f"Login response for {email} was missing token or user")
    print(f"PASS login {email}")
    return Session(email=email, token=token, user_id=user_id)


def multipart_file(
    field_name: str,
    filename: str,
    content_type: str,
    content: bytes,
    fields: dict[str, str],
) -> tuple[bytes, str]:
    boundary = f"----PulseLinkSmoke{uuid.uuid4().hex}"
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                value.encode(),
                b"\r\n",
            ]
        )
    chunks.extend(
        [
            f"--{boundary}\r\n".encode(),
            (
                f'Content-Disposition: form-data; name="{field_name}"; '
                f'filename="{filename}"\r\n'
            ).encode(),
            f"Content-Type: {content_type}\r\n\r\n".encode(),
            content,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def expect_dict(data: Any, label: str) -> dict[str, Any]:
    if not isinstance(data, dict):
        raise SmokeFailure(f"{label} must return an object")
    return data


def expect_list(data: Any, label: str) -> list[Any]:
    if not isinstance(data, list):
        raise SmokeFailure(f"{label} must return a list")
    return data


def main() -> int:
    sarah = login("sarah@pulselink.local")
    emma = login("emma@pulselink.local")
    alex = login("alex@pulselink.local")
    admin = login("admin@pulselink.local")

    for label, path in (
        ("profile", "/api/v1/profile"),
        ("security sessions", "/api/v1/security/sessions"),
        ("people", "/api/v1/people?q="),
        ("friend requests", "/api/v1/friend-requests"),
        ("conversations", "/api/v1/conversations"),
        ("notifications", "/api/v1/notifications?unread=false"),
        ("privacy", "/api/v1/privacy"),
        ("saved messages", "/api/v1/saved-messages"),
        ("message search", "/api/v1/message-search?q=photo"),
        ("my reports", "/api/v1/my-reports"),
    ):
        request("GET", path, token=sarah.token)
        print(f"PASS authenticated {label}")

    _, conversation_data, _ = request(
        "POST",
        f"/api/v1/conversations/direct/{emma.user_id}",
        token=sarah.token,
    )
    conversation = expect_dict(conversation_data, "direct conversation")
    conversation_id = str(conversation.get("id") or "")
    if not conversation_id:
        raise SmokeFailure("Direct conversation response did not contain an id")
    print("PASS direct conversation creation")

    client_message_id = f"api-smoke-{uuid.uuid4()}"
    _, sent_data, _ = request(
        "POST",
        f"/api/v1/conversations/{conversation_id}/messages",
        token=emma.token,
        body={
            "content": f"PulseLink API smoke {client_message_id}",
            "clientMessageId": client_message_id,
            "attachmentIds": [],
        },
        expected=(201,),
    )
    sent = expect_dict(sent_data, "send message")
    message_id = str(sent.get("id") or "")
    if not message_id:
        raise SmokeFailure("Message response did not contain an id")

    _, messages_data, _ = request(
        "GET",
        f"/api/v1/conversations/{conversation_id}/messages",
        token=sarah.token,
    )
    messages = expect_list(messages_data, "message history")
    if not any(str(item.get("id")) == message_id for item in messages if isinstance(item, dict)):
        raise SmokeFailure("Persisted message was not found in conversation history")
    print("PASS persisted direct message")

    request(
        "PUT",
        f"/api/v1/messages/{message_id}/reaction",
        token=sarah.token,
        body={"emoji": "✨"},
        expected=(204,),
    )
    request(
        "POST",
        f"/api/v1/messages/{message_id}/save",
        token=sarah.token,
        expected=(204,),
    )
    request(
        "POST",
        f"/api/v1/conversations/{conversation_id}/read",
        token=sarah.token,
        expected=(204,),
    )
    print("PASS reaction, save, and read receipt flows")

    upload_body, upload_type = multipart_file(
        "file",
        "pulse-smoke.txt",
        "text/plain",
        b"PulseLink private attachment smoke test\n",
        {"conversationId": conversation_id},
    )
    _, upload_data, _ = request(
        "POST",
        "/api/v1/files",
        token=sarah.token,
        body=upload_body,
        content_type=upload_type,
        expected=(200,),
    )
    upload = expect_dict(upload_data, "file upload")
    attachment_id = str(upload.get("id") or "")
    if not attachment_id:
        raise SmokeFailure("File upload response did not contain an id")

    request(
        "POST",
        f"/api/v1/conversations/{conversation_id}/messages",
        token=sarah.token,
        body={
            "content": "Attachment smoke",
            "clientMessageId": f"attachment-smoke-{uuid.uuid4()}",
            "attachmentIds": [attachment_id],
        },
        expected=(201,),
    )
    _, _, downloaded = request(
        "GET",
        f"/api/v1/files/{attachment_id}",
        token=emma.token,
    )
    if b"PulseLink private attachment" not in downloaded:
        raise SmokeFailure("Participant download did not return uploaded content")
    request(
        "GET",
        f"/api/v1/files/{attachment_id}",
        token=alex.token,
        expected=(403,),
    )
    print("PASS private attachment authorization")

    _, group_data, _ = request(
        "POST",
        "/api/v1/conversations/groups",
        token=sarah.token,
        body={
            "name": f"Smoke Group {uuid.uuid4().hex[:8]}",
            "memberIds": [emma.user_id, "10000000-0000-0000-0000-000000000003"],
        },
        expected=(201,),
    )
    group = expect_dict(group_data, "group creation")
    group_id = str(group.get("id") or "")
    request("GET", f"/api/v1/groups/{group_id}", token=emma.token)
    print("PASS group creation and member access")

    _, report_data, _ = request(
        "POST",
        "/api/v1/reports",
        token=sarah.token,
        body={
            "targetType": "MESSAGE",
            "targetUserId": None,
            "targetMessageId": message_id,
            "targetConversationId": None,
            "reason": "Smoke test",
            "description": "Automated moderation acceptance flow.",
        },
        expected=(201,),
    )
    report = expect_dict(report_data, "report creation")
    report_id = str(report.get("id") or "")
    request(
        "POST",
        f"/api/v1/admin/reports/{report_id}/claim",
        token=admin.token,
    )
    request(
        "GET",
        f"/api/v1/admin/reports/{report_id}/evidence",
        token=admin.token,
    )
    request(
        "POST",
        f"/api/v1/admin/reports/{report_id}/resolve",
        token=admin.token,
        body={
            "outcome": "NO_ACTION",
            "reason": "Automated smoke test resolution.",
        },
    )
    _, notifications_data, _ = request(
        "GET",
        "/api/v1/notifications?unread=false",
        token=sarah.token,
    )
    notifications = expect_dict(notifications_data, "notifications")
    items = notifications.get("items") or []
    if not any(
        isinstance(item, dict)
        and str((item.get("payload") or {}).get("reportId")) == report_id
        for item in items
    ):
        raise SmokeFailure("Resolved report notification was not persisted")
    print("PASS report moderation and persisted notification")

    request("GET", "/api/v1/admin/dashboard", token=admin.token)
    request("GET", "/api/v1/admin/users?page=0&size=5", token=admin.token)
    request("GET", "/api/v1/admin/reports?page=0&size=5", token=admin.token)
    request("GET", "/api/v1/admin/groups?page=0&size=5", token=admin.token)
    request("GET", "/api/v1/admin/audit-logs?page=0&size=5", token=admin.token)
    print("PASS administration portal APIs")

    print("Authenticated API smoke tests passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SmokeFailure as error:
        print(f"FAIL {error}", file=sys.stderr)
        raise SystemExit(1)
