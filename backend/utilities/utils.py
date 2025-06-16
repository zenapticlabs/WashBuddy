from rest_framework import (
    status,
    pagination,
)
from rest_framework.response import Response
import threading
from supabase import create_client
from django.core.mail import EmailMultiAlternatives
from django.template import loader

class ResponseInfo(object):
    """
    Class for setting how API should send response.
    """

    def __init__(self, **args):
        self.response = {
            "status_code": args.get("status", 200),
            "error": args.get("error", None),
            "data": args.get("data", []),
            "message": [args.get("message", "Success")],
        }


class CustomResponsePagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param  = 'page_size'

    def get_paginated_response(self, data):
        return Response(
            [
                {
                    "links": {
                        "total_pages": self.page.paginator.num_pages,
                        "next": self.get_next_link(),
                        "previous": self.get_previous_link(),
                        "current": self.page.number,
                    },
                    "count": self.page.paginator.count,
                    "results": data,
                    "status_code": status.HTTP_200_OK,
                }
            ]
        )

class SupabaseSingleton:
    _instance = None
    _lock = threading.Lock()

    @classmethod
    def get_instance(cls, url, key):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = create_client(url, key)
        return cls._instance
    

def send_mail(subject_text, email_template_name,
              context, from_email, to_emails_list, html_email_template_name=None):
    """
    Send a django.core.mail.EmailMultiAlternatives to `to_email`.
    """
    body = loader.render_to_string(email_template_name, context)

    email_message = EmailMultiAlternatives(
        subject_text, body, from_email, to_emails_list)
    if html_email_template_name is not None:
        html_email = loader.render_to_string(html_email_template_name, context)
        email_message.attach_alternative(html_email, 'text/html')

    email_message.send()