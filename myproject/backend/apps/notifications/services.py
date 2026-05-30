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

def create_notification(user, title, message, notif_type, reservation=None):
    # 1. Save to database (your existing logic)
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notif_type=notif_type,
        reservation=reservation
    )

    # 2. Send push notification to browser
    try:
        from webpush import send_user_notification
        payload = {
            'head': title,
            'body': message,
            'icon': '/icons/icon-192.png',
        }
        send_user_notification(user=user, payload=payload, ttl=1000)
    except Exception as e:
        # Don't crash if push fails (user may not be subscribed)
        print(f'Push notification failed: {e}')

    return notification