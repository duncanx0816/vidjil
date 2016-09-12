###
### Vidjil server, main configuration file
### This file must be named 'modules/defs.py' to be taken into account
###

### Email notifications for server errors
SMTP_SERVER = 'localhost'
# SMTP_SERVER = 'logging' # no mail
FROM_EMAIL = 'srv@example.org'
ADMIN_EMAILS = ['notifications@example.org']

### address for the sql database
###
DB_ADDRESS = 'sqlite://storage.sqlite'
DB_ADDRESS = 'mysql://vidjil:XXXXXXXX@localhost/vidjil'

### Backup file
DB_BACKUP_FILE = 'backup.csv'

### Upload directory for .fasta/.fastq.
### Old sequences files could be thrown away.
### No regular backup.

DIR_SEQUENCES = '/mnt/upload/uploads/'

### Upload directory for .vidjil/.fused/.analysis
### Regularly backuped

DIR_RESULTS = '/mnt/result/results/'

### Temporary directory to store vidjil results, and basename of files in this directory
### Formatted with 'data_id' in models/task.py
DIR_OUT_VIDJIL_ID = '/mnt/result/tmp/out-%06d/'
DIR_PRE_VIDJIL_ID = '/mnt/result/tmp/pre/out-%06d/'
BASENAME_OUT_VIDJIL_ID = '%06d'

### Directory for program used in task.py
### relative path start from server/web2py
DIR_VIDJIL = '/usr/bin/vidjil'
DIR_FUSE = '../../tools'
DIR_MIXCR = '../../'
DIR_GERMLINE = '/usr/share/vidjil/germline'
### Port on which to run the fuse server
### Used in models/task.py and in /server/fuse_server.py
PORT_FUSE_SERVER = 12789

### Log files
DIR_LOG = '/var/vidjil/'
LOG_INFO = DIR_LOG + 'vidjil.log'
LOG_DEBUG = DIR_LOG + 'vidjil-debug.log'

### Timeouts
# Delay in seconds before a task is considered in timeout
TASK_TIMEOUT = 2 * 60 * 60

### Reverse IP file
REVERSE_IP = '/home/vidjil/ips.txt'

### Locus (should be parsed from germlines.data)
LOCUS = ['TRA', 'TRA+D', 'TRB', 'TRG', 'TRD', 'TRD+',
         'IGH', 'IGH+', 'IGK', 'IGK+', 'IGL']
