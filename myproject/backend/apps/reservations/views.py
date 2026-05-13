from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Reservation
from .serializers import ReservationSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.permissions import IsAdmin

from django.utils.timezone import now
from .serializers import CalendarReservationSerializer
from apps.notifications.services import create_notification

class ReservationListCreateView(generics.ListCreateAPIView):

    serializer_class = ReservationSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == 'admin':
            return Reservation.objects.all()

        return Reservation.objects.filter(user=user)

    def perform_create(self, serializer):

        room = serializer.validated_data['room']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']

        # 1. prevent past booking
        if start_time < now():
            raise ValidationError({"error": "Cannot reserve past time."})

        # 2. validate time
        if end_time <= start_time:
            raise ValidationError({"error": "End time must be after start time."})

        # 3. room conflict
        room_conflict = Reservation.objects.filter(
            room=room,
            status='approved',
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if room_conflict:
            raise ValidationError({"error": "Room already booked."})

        # 4. USER conflict (NEW RULE)
        user_conflict = Reservation.objects.filter(
            user=self.request.user,
            status='approved',
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if user_conflict:
            raise ValidationError({
                "error": "You already have a reservation at this time."
            })

        serializer.save(user=self.request.user)

        try:
            print("[DEBUG] About to call create_notification")
            create_notification(
                user=self.request.user,
                title="Reservation Submitted",
                message="Your reservation request is pending approval."
            )
            print("[DEBUG] create_notification completed successfully")
        except Exception as e:
            print(f"[DEBUG] FAILED: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()


class ApproveReservationView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):

        try:
            reservation = Reservation.objects.get(pk=pk)

        except Reservation.DoesNotExist:

            return Response(
                {"error": "Reservation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if reservation.status != 'pending':

            return Response(
                {"error": "Only pending reservations can be modified"},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_status = request.data.get("status")

        if new_status not in ['approved', 'rejected']:

            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = new_status
        reservation.save()

        print("CREATING NOTIFICATION")

        create_notification(
            user=reservation.user,
            title=f"Reservation {new_status.title()}",
            message=f"Your reservation for {reservation.room.name} was {new_status}."
        )

        return Response({
            "message": f"Reservation {new_status} successfully"
        })
    
class CancelReservationView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            reservation = Reservation.objects.get(pk=pk, user=request.user)

        except Reservation.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        if reservation.status in ['pending', 'approved']:
            reservation.status = 'cancelled'
            reservation.save()

            create_notification(
                user=request.user,
                title="Reservation Cancelled",
                message=f"Your reservation for {reservation.room.name} was cancelled."
            )

            return Response({"message": "Reservation cancelled"})

        return Response(
            {"error": "Cannot cancel this reservation"},
            status=400
        )
    
class ReservationCalendarView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        reservations = Reservation.objects.filter(
            status='approved'
        )

        serializer = CalendarReservationSerializer(
            reservations,
            many=True
        )

        return Response(serializer.data)