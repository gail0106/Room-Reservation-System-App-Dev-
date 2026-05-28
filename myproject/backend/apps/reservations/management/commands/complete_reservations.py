from django.core.management.base import BaseCommand
from django.utils.timezone import now
from apps.reservations.models import Reservation
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = "Mark past approved reservations as completed and notify users"

    def handle(self, *args, **kwargs):
        expired = Reservation.objects.filter(
            status="approved",
            end_time__lt=now()
        )
        for reservation in expired:
            reservation.status = "completed"
            reservation.save()

            # Avoid duplicate notifications
            already_notified = Notification.objects.filter(
                user=reservation.user,
                reservation=reservation,
                notif_type="completed"
            ).exists()

            if not already_notified:
                Notification.objects.create(
                    user=reservation.user,
                    reservation=reservation,
                    title="Reservation Completed",
                    message=f"Your reservation for {reservation.room.name} has been completed. Thank you!",
                    notif_type="completed"
                )

        self.stdout.write(f"Completed {expired.count()} reservations.")