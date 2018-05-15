__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

def compile_list(folder_path, file_suffix=''):

    file_list = []

    from os import listdir, path
    for file_name in listdir(folder_path):
        file_path = path.join(folder_path, file_name)
        if path.isfile(file_path):
            if not file_suffix or file_name.find(file_suffix) > -1:
                file_list.append(file_path)

    return file_list

def bundle_modules(logging_status='DEBUG'):
    
    js_bundles = []
    
    from flask_assets import Bundle
    project_modules = []
    js_filters = [ 'uglifyjs' ]
    if logging_status == 'DEBUG':
        js_filters = [ ]
    for module in compile_list('assets/scripts'):
        project_modules.append(module.replace('assets/','../assets/'))
    for module in compile_list('scripts'):
        project_modules.append(module.replace('scripts/','../scripts/'))
    if project_modules:
        js_bundles.append(Bundle(*project_modules, filters=js_filters, output='scripts/project.min.js'))
    
    return js_bundles

def bundle_sheets(logging_status='DEBUG'):
    
    css_bundles = []
    
    from flask_assets import Bundle
    
    project_sheets = []
    css_filters = ['pyscss', 'autoprefixer6', 'cssmin']
    if logging_status == 'DEBUG':
        css_filters.pop()
    for sheet in compile_list('assets/styles'):
        project_sheets.append(sheet.replace('assets/', '../assets/'))
    for sheet in compile_list('styles'):
        project_sheets.append(sheet.replace('styles/', '../styles/'))
    if project_sheets:
        css_bundles.append(Bundle(*project_sheets, filters=css_filters, output='styles/project.min.css'))
    
    return css_bundles

def construct_response(request_details, request_model=None, endpoint_list=None, ignore_errors=False, check_session=False):

    '''
        a method to construct fields for a flask response

    :param request_details: dictionary with details extracted from request object
    :param request_model: [optional] object with jsonmodel class properties
    :param endpoint_list: [optional] list of strings with acceptable route endpoints
    :param ignore_errors: [optional] boolean to ignore errors
    :param check_session: [optional] boolean to check for session
    :return: dictionary with fields for a flask response
    '''

# import dependencies
    from labpack.records.id import labID
    from labpack.parsing.flask import validate_request_content

# construct default response
    record_id = labID()
    response_details = {
        'dt': record_id.epoch,
        'id': record_id.id36,
        'code': 200,
        'error': '',
        'details': {}
    }

# validate request format
    if ignore_errors:
        return response_details
    if request_details['error']:
        response_details['error'] = request_details['error']
        response_details['code'] = request_details['code']
        return response_details
    if endpoint_list:
        from os import path
        route_root, route_endpoint = path.split(request_details['route'])
        if not route_endpoint in endpoint_list:
            from labpack.parsing.grammar import join_words
            response_details['error'] = 'request endpoint must be one of %s' % join_words(endpoint_list)
            response_details['code'] = 400
            return response_details
    if check_session:
        if not request_details['session']:
            response_details['error'] = 'request missing valid session token'
            response_details['code'] = 400
            return response_details
    if request_model:
        if not request_details['json']:
            response_details['error'] = 'request body must be content-type application/json'
            response_details['code'] = 400
        else:
            status_details = validate_request_content(request_details['json'], request_model)
            if status_details['error']:
                response_details['error'] = status_details['error']
                response_details['code'] = status_details['code']

    return response_details

def parse_query(query_text, producers_map):

# tokens input
    tokens = query_text.lower().split(' ')

# parse tokens
    action = ''
    producer_id = ''
    claim_id = ''
    verify_list = [ 'verify', 'check', 'tell' ]
    attest_list = [ 'attest', 'vouch', 'i', 'report' ]
    for token in tokens:
        if token in verify_list:
            action = 'verify'
            producer_id = 'andrew'
            claim_id = 'andrew_nyc'
            break
        elif token in attest_list:
            action = 'attest'
            producer_id = 'brooks'
            claim_id = 'brooks_nyc'
            break

# construct result
    parsed_result = {
        'action': action,
        'producer_id': producer_id,
        'claim_id': claim_id
    }

    return parsed_result

def get_attestations(query_map, attesters_map):
    
    attestation_list = []
    
    import requests
    url = 'http://localhost:5000/verify'
    try:
        response = requests.get(url)
    except:
        pass
    from time import sleep
    sleep(0.5)

    return attestation_list

def post_attestation(query_map, attester_signature):
    
    api_response = {}
    import requests
    url = 'http://localhost:5000/attest'
    try:
        response = requests.get(url)
    except:
        pass
    
    return api_response

def synthesize_attestations(attestation_list, producers_map, attesters_map):
    
    msg = "The claim that Andrew's Honey is Made in NYC is verified by 2 out of 3 of your trusted sources."
    content = {
        'producer': producers_map['andrews'],
        'attesters': attesters_map
    }

    return msg, content

def synthesize_attestation(attestation_result, producers_map):
    
    msg = 'Your attestation of Brooks Rooftop Farm has been submitted.'
    
    return msg
    

if __name__ == '__main__':
    
    from server.init import producers_map
    test_msg = 'verify that Andrews honey is made in new york'
    test_result = parse_query(test_msg, producers_map)
    print(test_result)