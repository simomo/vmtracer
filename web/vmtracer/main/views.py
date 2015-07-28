import ujson

import MySQLdb
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.db import connection

def dictfetchall(cursor): 
    "Returns all rows from a cursor as a dict" 
    desc = cursor.description 
    return [
            dict(zip([col[0] for col in desc], row)) 
            for row in cursor.fetchall() 
    ]


# Create your views here.
def mainpage(request):
    return  render_to_response('static/index.html')


def init(request):
    trace_id = request.GET.get('trace_id', 65)

    result = {
        'ops_info': [],
        'log_lines': [],  # ops_id -> log lines
    }

    cur = connection.cursor()
    cur.execute('select * from vmoptrecords as ops left join vmoptslist as op_type on ops.vmoptrecordfkvmoptid=op_type.vmoptid where vmoptrecordfkintid = %s' % trace_id)
    result['ops_info'] = dictfetchall(cur)

    op_ids = [item['vmoptrecordid'] for item in result['ops_info']]
    sql = 'select * from loglinerecord where loglinerecordfkvmoptrecordid in (%s)' % ','.join([str(item) for item in op_ids])
    cur.execute('select * from loglinerecord where loglinerecordfkvmoptrecordid in (%s)' % ','.join([str(item) for item in op_ids]))
    result['log_lines'] = dictfetchall(cur)

    return HttpResponse(ujson.dumps(result), content_type="text/javascript")

