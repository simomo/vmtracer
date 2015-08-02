from itertools import groupby

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


def _highlight(line):
    keywords = [line['highlightkeys'], line['highlightkeys2']]
    
    for keyword in filter(lambda x: x, keywords):
        line['line'] = line['line'].replace(keyword, '<span class="log-hl">%s</span>' % keyword)
    line['line'] = '<span class="line-num">%s</span> <span class="one-line">' % line['lineno'] + line['line'] + '</span>'
    return line

def test(line):
    return line

def get_log(request):
    op_id = request.GET['op_id']
    result = {'logs': {}}

    cur = connection.cursor()
    sql_log = '''
    select * from loglinerecord as log_line 
    left join logrecord on log_line.loglinerecordfkrecordid = logrecord.logrecordid 
    where loglinerecordfkvmoptrecordid = %s order by lineno''' % op_id
    cur.execute(sql_log)
    r = dictfetchall(cur)

    # add highlight
    new_r = map(_highlight, r)

    # groupby file name
    for log_file_name, lines in groupby(new_r, lambda x: x['logfilename']):
        result['logs'][log_file_name] = list(lines)

    return HttpResponse(ujson.dumps(result), content_type='text/javascript')


def init(request):
    trace_id = request.GET.get('trace_id', 365)

    result = {
        'trace_info': {},  # TODO
        'host_info': [],
        'vm_info': [],
        'ops_info': [],
        'log_lines': [],  # ops_id -> log lines
    }

    cur = connection.cursor()

    #trace_info
    sql_trace_info = 'select * from traceinstance'
    cur.execute(sql_trace_info)
    result['trace_info'] = dictfetchall(cur)

    # host_info
    sql_host_info = 'select * from hostinfo where hostfkid = %s' % trace_id
    cur.execute(sql_host_info)
    result['host_info'] = dictfetchall(cur)

    # vm_info
    sql_vm_info = 'select * from vminfo left join vmconfig on vminfo.vmid = vmconfigfkvminfoid where vmfkintid = %s' % trace_id
    cur.execute(sql_vm_info)
    result['vm_info'] = dictfetchall(cur)
    def _converter(item):
        item['vmconfig'] = eval(item['vmconfig'])
        return item
    result['vm_info'] = map(_converter, result['vm_info'])

    # ops_info
    sql_ops_info = '''
    select * from vmoptrecords as ops 
    left join vmoptslist as op_type on ops.vmoptrecordfkvmoptid=op_type.vmoptid 
    left join loglinerecord as log_line on ops.vmoptrecordid = log_line.loglinerecordfkvmoptrecordid
    left join vminfo on log_line.loglinerecordfkvmid = vminfo.vmid
    where vmoptrecordfkintid = %s
    group by ops.vmoptrecordid
    ''' % trace_id
    cur.execute(sql_ops_info)
    result['ops_info'] = dictfetchall(cur)

    # log_lines
    op_ids = [item['vmoptrecordid'] for item in result['ops_info']]
    sql = 'select * from loglinerecord where loglinerecordfkvmoptrecordid in (%s)' % ','.join([str(item) for item in op_ids])
    cur.execute('select * from loglinerecord where loglinerecordfkvmoptrecordid in (%s)' % ','.join([str(item) for item in op_ids]))
    result['log_lines'] = dictfetchall(cur)

    return HttpResponse(ujson.dumps(result), content_type="text/javascript")


def init_pre(request):
    result = {
        'trace_info': {},  # TODO
        'host_info': [],
        'vm_info': [],
        'ops_info': [],
        'log_lines': [],  # ops_id -> log lines
    }

    cur = connection.cursor()

    #trace_info
    sql_trace_info = 'select * from traceinstance'
    cur.execute(sql_trace_info)
    result['trace_info'] = dictfetchall(cur)
    
    return HttpResponse(ujson.dumps(result), content_type="text/javascript")
