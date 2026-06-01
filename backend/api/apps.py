from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api' # Make sure this matches your app name

    def ready(self):
        # Implicitly connect signal handlers decorated with @receiver.
        import api.signals
