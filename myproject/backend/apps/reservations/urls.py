from django.urls import path
from .views import ReservationListCreateView, ApproveReservationView, CancelReservationView, ReservationCalendarView

urlpatterns = [
    
    path('', ReservationListCreateView.as_view()),
    path('<int:pk>/approve/', ApproveReservationView.as_view()),
    path('<int:pk>/cancel/', CancelReservationView.as_view()),
    path('calendar/', ReservationCalendarView.as_view()),
    
]