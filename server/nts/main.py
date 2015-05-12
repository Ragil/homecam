import os
import requests

from util import jsonify, config
from flask import Flask, request, json, abort
from flask.ext.compress import Compress
from flask.ext.cors import cross_origin


app = Flask(__name__)
app.config.update(
  debug=True,
  JSON_SORT_KEYS=True,
  JSONIFY_PRETTYPRINT_REGULAR=False,
)
Compress(app)

# dynamic properties
ndb_config = config.NDBConfigSource('local')
properties = config.Properties([
  ndb_config,
  config.ConfigServiceSource('global')
])


# cache for tokens - TODO : use memcache
tokenCache = {}


# convert all errors into json
def generic_error_handler(error):
  try:
    return json.jsonify(error.description), error.code
  except:
    return error

for error in range(400, 420):
    app.error_handler_spec[None][error] = generic_error_handler


@app.route('/admin/config', methods=['POST'])
@cross_origin()
@jsonify
def put_config():
  """Update ndb config.

  props - a json object of props
  """
  data = request.get_json()
  if not data or 'props' not in data:
    abort(400, { 'error' : 'props is required' })

  ndb_config.store(data['props'])
  return ndb_config.fetch()

@app.route('/admin/config', methods=['GET'])
@cross_origin()
@jsonify
def get_config():
  return ndb_config.fetch({})


@app.route('/nts', methods=['POST'])
@cross_origin()
@jsonify
def nts(*args, **kwargs):
  """Generate ice_server for a given room.

  room: the room id
  """
  room = request.args.get('room', '')
  if not room:
    abort(400, {'error' : 'room is required'})

  if room in tokenCache:
    return tokenCache[room]

  props = properties.fetch()
  accountSID = props['twilioAccountSID']
  authToken = props['twilioAuthToken']

  url = 'https://api.twilio.com/2010-04-01/Accounts/%s/Tokens.json' % accountSID
  r = requests.post(url, auth=(accountSID, authToken))

  if r.status_code >= 200 and r.status_code < 300:
    data = r.json()
    tokenCache[room] = {
      'iceServers' : data['ice_servers']
    }
    return tokenCache[room]

  return {'error' : r.content}


if __name__ == '__main__':
  app.run()
