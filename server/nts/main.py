import os
import requests

from util import jsonify
from flask import Flask, request
from flask.ext.compress import Compress
from flask.ext.cors import cross_origin


app = Flask(__name__)
app.config.update(
  debug=True,
  JSON_SORT_KEYS=True,
  JSONIFY_PRETTYPRINT_REGULAR=False,
)
Compress(app)


if 'twilioAccountSID' not in os.environ:
  raise ValueError('twilioAccountSID is not defined in env')
if 'twilioAuthToken' not in os.environ:
  raise ValueError('twilioAuthToken is not defined in env')

accountSID = os.environ['twilioAccountSID']
authToken = os.environ['twilioAuthToken']

tokenCache = {}


@app.route('/nts', methods=['POST'])
@cross_origin()
@jsonify
def nts(*args, **kwargs):
  """Generate ice_server for a given room.

  room: the room id
  """

  room = request.args.get('room', '')
  if not room:
    raise ValueError('Room is required')

  if room in tokenCache:
    return tokenCache[room]

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
