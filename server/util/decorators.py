from flask import json


def jsonify(func):
  """Convert response into json object."""
  def inner(*args, **kwargs):
    response = func(args, kwargs)
    return json.jsonify(response)
  return inner
