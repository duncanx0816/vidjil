# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
request.requires_https()

if not request.env.web2py_runtime_gae:
    ## if NOT running on Google App Engine use SQLite or other DB
    db = DAL('sqlite://storage.sqlite',pool_size=1,check_reserved=['all'])
else:
    ## connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore')
    ## store sessions and tickets there
    session.connect(request, response, db=db)
    ## or store session in Memcache, Redis, etc.
    ## from gluon.contrib.memdb import MEMDB
    ## from google.appengine.api.memcache import Client
    ## session.connect(request, response, db = MEMDB(Client()))

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []
## (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'

#########################################################################
## Here is sample code if you need for
## - email capabilities
## - authentication (registration, login, logout, ... )
## - authorization (role based authorization)
## - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
## - old style crud actions
## (more options discussed in gluon/tools.py)
#########################################################################

from gluon.tools import Auth, Crud, Service, PluginManager, prettydate
auth = Auth(db)
crud, service, plugins = Crud(db), Service(), PluginManager()

## create all tables needed by auth if not custom tables
auth.define_tables(username=False, signature=False)

## configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' or 'smtp.gmail.com:587'
mail.settings.sender = 'you@gmail.com'
mail.settings.login = 'username:password'

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

## if you need to use OpenID, Facebook, MySpace, Twitter, Linkedin, etc.
## register with janrain.com, write your domain:api_key in private/janrain.key
from gluon.contrib.login_methods.rpx_account import use_janrain
use_janrain(auth, filename='private/janrain.key')

#########################################################################
## Define your tables below for example
##
## >>> db.define_table('mytable',Field('myfield','string'))
##
## Fields can be 'string','text','password','integer','double','boolean'
##       'date','time','datetime','blob','upload', 'reference TABLENAME'
## There is an implicit 'id integer autoincrement' field
## Consult manual for more options, validators, etc.
##
## More API examples for controllers:
##
## >>> db.mytable.insert(myfield='value')
## >>> rows=db(db.mytable.myfield=='value').select(db.mytable.ALL)
## >>> for row in rows: print row.id, row.myfield
#########################################################################


db.define_table('patient',
                Field('first_name','string'),
                Field('last_name','string'),
                Field('birth','date'),
                Field('info','text'),
                Field('id_label','string'),
                )

'''
db.patient.first_name.requires = IS_NOT_EMPTY( error_message='input needed' )
db.patient.last_name.requires = IS_NOT_EMPTY( error_message='input needed' )
db.patient.birth.requires = IS_DATE(format=T('%Y-%m-%d'),
                   error_message='must be YYYY-MM-DD!')
'''



db.define_table('sequence_file',
                Field('patient_id', 'reference patient'),
                Field('sampling_date','date'),
                Field('info','text'),
                Field('filename','text'),
                Field('pcr','text'),
                Field('sequencer','text'),
                Field('producer','text'),
                Field('size_file','integer'),
                Field('data_file', 'upload', length=1000000000000, autodelete=True))




db.define_table('standard_file',
                Field('name', 'string'),
                Field('info','text'),
                Field('data_file', 'upload',autodelete=True, length=1000000000000))



db.define_table('config',
                Field('name', 'string'),
                Field('command', 'string'),
                Field('info','text'),
                Field('germline', 'string'))


db.define_table('results_file',
                Field('sequence_file_id', 'reference sequence_file'),
                Field('config_id', 'reference config'),
                Field('run_date','datetime'),
                Field('scheduler_task_id', 'integer'),
                Field('data_file', 'upload', length=1000000000000, autodelete=True))

db.define_table('fused_file',
                Field('patient_id', 'reference patient'),
                Field('config_id', 'reference config'),
                Field('fuse_date','datetime'),
                Field('status', 'string'),
                Field('fused_file', 'upload', length=1000000000000, autodelete=True))

db.define_table('analysis_file',
                Field('patient_id', 'reference patient'),
                Field('config_id', 'reference config'),
                Field('analyze_date','datetime'),
                Field('status', 'string'),
                Field('analysis_file', 'upload', length=1000000000000, autodelete=True))


if db(db.auth_user.id > 0).count() == 0:
    id_first_user=""
        
    ## création du premier user
    id_first_user=db.auth_user.insert(
        password = db.auth_user.password.validate('1234')[0],
        email = 'plop@plop.com',
        first_name = 'System',
        last_name = 'Administrator'
    )
            
    ## création des groupes de base
    id_admin_group=db.auth_group.insert(role='admin')
    id_sa_group=db.auth_group.insert(role='user_1')
    db.auth_group.insert(role="public")
            
    db.auth_membership.insert(user_id=id_first_user, group_id=id_admin_group)
    db.auth_membership.insert(user_id=id_first_user, group_id=id_sa_group)
    
    ##création des configs de base
    id_config_TRG = db.config.insert(
        name = 'TRG',
        command = '-c clones -z 100 -R 1 -r 1 ',
        info = 'default trg config',
        germline = 'TRG'
    )
    id_config_IGH = db.config.insert(
        name = 'IGH',
        command = '-c clones -d -z 100 -R 1 -r 1 ',
        info = 'default igh config',
        germline = 'IGH'
    )
    
    ## permission
    ## system admin have admin/read/create rights on all patients, groups and configs
    auth.add_permission(id_admin_group, 'admin', db.patient, 0)
    auth.add_permission(id_admin_group, 'admin', db.auth_group, 0)
    auth.add_permission(id_admin_group, 'admin', db.config, 0)
    auth.add_permission(id_admin_group, 'read', db.patient, 0)
    auth.add_permission(id_admin_group, 'read', db.auth_group, 0)
    auth.add_permission(id_admin_group, 'read', db.config, 0)
    auth.add_permission(id_admin_group, 'create', db.patient, 0)
    auth.add_permission(id_admin_group, 'create', db.auth_group, 0)
    auth.add_permission(id_admin_group, 'create', db.config, 0)
 


## after defining tables, uncomment below to enable auditing
auth.enable_record_versioning(db)

## Logging

import logging

class MsgUserAdapter(logging.LoggerAdapter):

    def process(self, msg, kwargs):
        if type(msg) is dict:
            msg = msg['message']
        new_msg =  '<%s> %s' % ((auth.user.first_name if auth.user else ''), msg)
        return new_msg, kwargs
    
#

def _init_log():
    """
    adapted from http://article.gmane.org/gmane.comp.python.web2py/11091
    """

    import logging

    logger = logging.getLogger('vidjil') # (request.application)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        handler = logging.FileHandler('/var/vidjil/vidjil.log')
        handler.setLevel(logging.DEBUG)
        handler.setFormatter(logging.Formatter('%s' % request.client + ' [%(process)d] %(asctime)s - %(levelname)s %(filename)s:%(lineno)d - %(message)s'))
        logger.addHandler(handler) 
        logger.info("Creating logger")
    return MsgUserAdapter(logger, {})

log = _init_log()





