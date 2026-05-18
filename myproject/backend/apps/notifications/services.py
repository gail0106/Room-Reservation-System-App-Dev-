from .models import Notification

print("SERVICES MODULE LOADED")

def create_notification(
    user,
    title,
    message,
    notif_type="info",
    reservation=None
):
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notif_type=notif_type,  # ✅ was 'type=notif_type' — that was the bug
        reservation=reservation
    )