from django.conf.urls import patterns, include, url
from django.contrib import admin

from main import views as main_views
from vmtracer import settings

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'vmtracer.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^static/(?P<path>(?:js|css|img)/.*)$', 'django.contrib.staticfiles.views.serve', ),
    url(r'^$', 'django.contrib.staticfiles.views.serve', kwargs={
                'path': '/static/index.html'}),
    url(r'^init/', main_views.init),
    url(r'^init_pre/', main_views.init_pre),
    url(r'^get_log/', main_views.get_log),
)
