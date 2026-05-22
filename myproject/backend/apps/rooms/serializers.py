from rest_framework import serializers
from django.utils.timezone import now
from django.utils import timezone
from apps.reservations.models import Reservation
from .models import Room
import datetime

class RoomSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'name', 'capacity', 'location', 'status']

    def get_status(self, obj):
        today = now().date()

        # Start and end of today (midnight to midnight)
        day_start = timezone.make_aware(datetime.datetime.combine(today, datetime.time.min))
        day_end   = timezone.make_aware(datetime.datetime.combine(today, datetime.time.max))

        # Get all approved reservations for this room that overlap today
        reservations = Reservation.objects.filter(
            room=obj,
            status='approved',
            start_time__lt=day_end,
            end_time__gt=day_start,
        ).order_by('start_time')

        if not reservations.exists():
            return 'available'

        # Check if reservations cover the full 24 hours of today
        covered_start = day_start
        for res in reservations:
            res_start = max(res.start_time, day_start)
            res_end   = min(res.end_time,   day_end)

            if res_start > covered_start:
                # There's a gap — day is not fully covered
                return 'available'

            if res_end > covered_start:
                covered_start = res_end

        # If we've covered all the way to end of day → fully booked
        return 'occupied' if covered_start >= day_end else 'available'