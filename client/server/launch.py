__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

# create init path to sibling folders
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# initialize app and scheduler objects
from server.init import app, scheduler, api_model
from flask import request, session, jsonify, url_for, render_template, Response

# add cross origin support
from flask_cors import CORS
CORS(app)

# bundle and register js scripts and css styles in flask
# IMPORTANT NOTE:   postcss is not recognized in PyCharm's run environment
#                   use the command line to propagate changes to lab.scss
from flask_assets import Environment
from server.utils import bundle_modules, bundle_sheets
# js_bundle = bundle_modules('INFO')
# css_bundle = bundle_sheets('INFO')
# js_bundle = bundle_modules()
# css_bundle = bundle_sheets()
assets = Environment(app)
js_assets = [ 
    'js_assets',
    'scripts/jquery-3.1.1.min.js',
    'scripts/sprintf.min.js',
    'scripts/autosize.js',
    'scripts/bootstrap.min.js',
    'scripts/project.min.js'
]
# js_assets.extend(js_bundle)
assets.register(*js_assets)
css_assets = [ 
    'css_assets',
    'styles/bootstrap.css',
    'styles/icomoon.css',
    'styles/simple-line-icons.css',
    'styles/project.min.css'
]
# css_assets.extend(css_bundle)
assets.register(*css_assets)

# import speech client and databases
from server.utils import construct_response, parse_query, get_attestations, post_attestation, synthesize_attestation, synthesize_attestations
from server.init import speech_client, producers_map, attesters_map

# define jinja content
from labpack.records.settings import load_settings
main_details = load_settings('copy/main.json')
menu_details = load_settings('copy/menu.json')
landing_kwargs = {
    'menu': menu_details
}
landing_kwargs.update(**main_details)

@app.route('/')
def landing_page():
    ''' landing page route '''
    return render_template('dashboard.html', **landing_kwargs), 200

@app.route('/query', methods=['POST'])
def query_route():
    
    ''' query route '''

    # ingest request params
    from labpack.parsing.flask import extract_request_details
    request_details = extract_request_details(request)
    user_token = request_details['params'].get('token', '')
    query_type = request_details['json'].get('type', '')
    query_text = request_details['json'].get('text', '')

    # construct generic response
    response_details = construct_response(request_details)
    details = {
        'msg': "Yeah... I didn't get that. Try again.",
        'audio': {},
        'content': {}
    }

    # parse text
    query_map = parse_query(query_text, producers_map)

    # request attestations
    if query_map['action'] == 'verify':
        attestation_list = get_attestations(query_map, attesters_map)
        msg, content = synthesize_attestations(attestation_list, producers_map, attesters_map)
        details['msg'] = msg
        details['content'] = content

    elif query_map['action'] == 'attest':
        attester_signature = user_token
        attestation_result = post_attestation(query_map, attester_signature)
        msg = synthesize_attestation(attestation_result, producers_map)
        details['msg'] = msg

    if query_type == 'speech' and details['msg']:
        from base64 import b64encode
        synthesize_response = speech_client.synthesize(details['msg'], voice_id='Nicole')
        audio_stream = synthesize_response['audio_stream']
        content_type = synthesize_response['content_type']
        base64_audio = b64encode(audio_stream).decode()
        details['audio'] = { 'audio_data': base64_audio, 'content_type': content_type, 'volume_level': 1.0 }

    response_details['details'] = details
    app.logger.debug(response_details)
    return jsonify(response_details), response_details['code']

@app.route('/sources', methods=['GET', 'POST', 'DELETE'])
def sources_route():
    
    ''' sources route '''
    
    # ingest request params
    from labpack.parsing.flask import extract_request_details
    request_details = extract_request_details(request)
    response_details = construct_response(request_details)
    
    # send response
    response_details['details'] = attesters_map
    app.logger.debug(response_details)
    return jsonify(response_details), response_details['code']

@app.route('/api/v1')
def api_v1_route():
    ''' docs page route '''
    return jsonify(api_model), 200

@app.route('/api/v1/<resource_type>', methods=['GET','POST'])
def api_v1_resource_route(resource_type=''):
    pass

@app.route('/api/v1/<resource_type>/<resource_id>', methods=['GET','PUT','PATCH','DELETE'])
def api_v1_resource_id_route(resource_type='', resource_id=''):
    pass

# construct the catchall for URLs which do not exist
@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', **landing_kwargs), 404

# attach app to scheduler and start scheduler
scheduler.init_app(app)
scheduler.start()

# initialize test wsgi localhost server with default memory job store
if __name__ == '__main__':
    from gevent.pywsgi import WSGIServer
    http_server = WSGIServer(('0.0.0.0', 5001), app)
    http_server.serve_forever()
    # app.run(host='0.0.0.0', port=5001)
