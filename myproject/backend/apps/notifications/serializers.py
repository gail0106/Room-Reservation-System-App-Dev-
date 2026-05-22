from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    room_name   = serializers.CharField(source='reservation.room.name',       read_only=True)
    start_time  = serializers.DateTimeField(source='reservation.start_time',  read_only=True)
    end_time    = serializers.DateTimeField(source='reservation.end_time',    read_only=True)
    status      = serializers.CharField(source='reservation.status',          read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notif_type',
            'is_read',
            'created_at',
            'reservation',
            'room_name',
            'start_time',
            'end_time',
            'status',
        ]