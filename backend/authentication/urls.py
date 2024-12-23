from django.urls import path
from . import views

urlpatterns = [
    path('patient/<int:patient_id>/vital-signs/', 
         views.get_vital_signs, 
         name='get-vital-signs'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('register/', views.register, name='register'),
    path('create-patient-profile/', views.create_patient_profile, name='create-patient-profile'),
    path('user-info/', views.get_user_info, name='user-info'),
    path('dashboard-stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('patients/', views.get_patients, name='get_patients'),
    path('patient/<int:patient_id>/', views.get_patient_details, name='patient-details'),
    path('notifications/', views.NotificationViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='notifications'),
    path('notifications/<int:pk>/', views.NotificationViewSet.as_view({
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='notification-detail'),   
    path('notifications/mark-all-read/', views.mark_all_notifications_read, 
         name='mark-all-notifications-read'),
    path('predictions/', views.PredictionViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='predictions-list'),
    path('predictions/<int:pk>/', views.PredictionViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='prediction-detail'),
    path('treatment-plans/', views.TreatmentPlanViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='treatment-plans-list'),
    path('treatment-plans/<int:pk>/', views.TreatmentPlanViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='treatment-plan-detail'),
    path('patient/<int:patient_id>/submit-test-results/', views.submit_test_results, name='submit-test-results'),
    path('patient/<int:patient_id>/assign-doctor/', views.assign_doctor, name='assign-doctor'),
    path('patient/<int:patient_id>/remove-doctor/', views.remove_doctor, name='remove-doctor'),
    path('patient/<int:patient_id>/test-results/', views.get_test_results, name='get-test-results'),
    path('admin/stats/', views.get_system_stats, name='admin-stats'),
    path('admin/users/', views.manage_users, name='manage-users'),
    path('admin/users/<int:user_id>/', views.manage_users, name='manage-user'),
    path('admin/resources/', views.manage_resources, name='manage-resources'),
    path('admin/model/retrain/', views.retrain_model, name='retrain-model'),
    path('get_profile/', views.get_profile, name='get_profile'),
    path('update_profile/', views.update_profile, name='update_profile'),
    path('change_password/', views.change_password, name='change_password'),
    path('patient/<int:patient_id>/test-results/<int:test_id>/', 
         views.get_test_result_detail, 
         name='test-result-detail'),
    path('test-results/<int:test_result_id>/predict/', 
         views.generate_prediction, 
         name='generate-prediction'),
    path('test-results/<int:test_result_id>/predictions/', 
         views.get_predictions, 
         name='get-predictions'),
    path('predictions/<int:prediction_id>/treatment-plan/', 
         views.treatment_plan, 
         name='treatment-plan'),
    path('treatment-plans/all/', views.get_treatment_plans, name='get_treatment_plans'),
    path('predictions/stats/', 
         views.get_prediction_stats, 
         name='prediction-stats'),
    path('rooms/', views.manage_rooms, name='manage-rooms'),
    path('rooms/<int:room_id>/', views.room_detail, name='room-detail'),
    path('rooms/<int:room_id>/book/', views.book_room, name='book-room'),
    path('room-bookings/', views.room_bookings, name='room-bookings'),
    path('rooms/<int:room_id>/bookings/', views.room_bookings, name='room-specific-bookings'),
    path('rooms/<int:room_id>/occupy/', views.occupy_room, name='occupy-room'),
    path('rooms/<int:room_id>/unoccupy/', views.unoccupy_room, name='unoccupy-room'),
    path('settings/', views.manage_settings, name='manage-settings'),
    path('settings/reset/', views.reset_settings, name='reset-settings'),
    path('settings/notifications/', views.get_notification_preferences, name='notification-preferences'),
]
