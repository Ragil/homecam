from flask import json
from functools import wraps


def jsonify(func):
  """Convert response into json object."""
  @wraps(func)
  def inner(*args, **kwargs):
    response = func(args, kwargs)
    return json.jsonify(response)
  return inner
