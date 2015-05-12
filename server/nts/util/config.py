import logging
import requests
from time import time

try:
  from google.appengine.ext import ndb
except e:
  logging.warn('appengine not found, NDBConfigSource will not work')


class NDBConfig(ndb.Model):
  props = ndb.JsonProperty()


class PropertySource(object):
  """A source of properties."""

  # time to live in seconds
  ttl = 60

  def fetch(self, existing_props={}):
    """Fetch properties.

    existing_props - all the properties that have been fetched so far
    return dictionary of properties
    """
    raise ValueError('should be implemented by subclass')


class NDBConfigSource(PropertySource):
  """Fetch/Store properties from appengine ndb"""

  def __init__(self, key):
    self.key = key

  def fetch(self, existing_props={}):
    """Fetch properties from ndb for a given key.

    return properties or empty {} if not found
    raise ValueError when not in appengine context
    """
    if not ndb:
      raise ValueError('not inside appengine context')

    config = NDBConfig.get_by_id(self.key)
    if not config:
      return {}

    return config.props

  def store(self, props):
    """Update ndb config entry"""
    config = NDBConfig(id = self.key, props = props).put()
    return props


class ConfigServiceSource(PropertySource):

  def __init__(self, namespace=None):
    """Define a config source from centralized config service.

    namespace - the config namespace
    """
    if not namespace:
      raise ValueError("url is required")

    self.namespace = namespace
    self.url = 'https://ragilconfig.appspot.com/config/%s' % self.namespace

  def fetch(self, existing_props={}):
    r = requests.get(self.url,
        auth=(existing_props['username'], existing_props['password']))

    if r.status_code == 200:
      return r.json()

    raise ValueError('Cannot fetch properties for namespace %s.\n%s' %
        (namespace, r.json()))


class Properties(object):

  def __init__(self, sources=[]):
    """Manages property lifecycle.

    sources - a list of PropertySource
    """
    self.sources = sources
    self.prop_cache = {}

  def fetch(self):
    """Return properties from all config sources"""
    props = {}
    for source in self.sources:

      prop = None

      # check if we still have valid props
      if source in self.prop_cache:
        if int(time()) - self.prop_cache[source]['ts_created'] < source.ttl:
          prop = self.prop_cache[source]['prop']

      if not prop:
        prop = source.fetch(props)
        self.prop_cache[source] = {
          'ts_created' : int(time()),
          'prop' : prop
        }

      props.update(prop)

    return props
