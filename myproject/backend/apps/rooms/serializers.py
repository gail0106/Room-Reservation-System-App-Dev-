from rest_framework import serializers
from django.utils.timezone import now
from apps.reservations.models import Reservation
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'name', 'capacity', 'location', 'status']

    def get_status(self, obj):
        current_time = now()
        is_occupied = Reservation.objects.filter(
            room=obj,
            status='approved',
            end_time__gte=current_time
        ).exists()
        return 'occupied' if is_occupied else 'available'