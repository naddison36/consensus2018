/**
* API JAVASCRIPT EXTENSION
* @author rcj1492
* @license ©2017-2018 Collective Acuity
* @email support@collectiveacuity.com
* 
* requires: 
* jquery.js
* sprintf.js
* stackoverflow.js
* autosize.js
* lab.js
* audio.js
* forms.js
**/

// import $ from jquery
// import sprintf from sprintf
// import autosize from autosize
// import { syntaxHighlight } from stackoverflow
// import * from lab
// import { errorConstructor, toggleView, scrollDiv, flexibleDialog, slideoutDialog, menuBindings, blockquoteDialog, requestingResource, updateConversation } from dependencies
// import { playAudio, startSpeechRecognition, stopSpeechRecognition } from audio
// import { showMessage, hideMessage, inputHandler, statusButtonHandler } from forms

function registerHandler(input_selector, submit_callback) {

/* a method to bind a submission callback to an input field */

// define method variables
    var key_code;
    var input_value;
    
// block normal enter behavior
    $(input_selector).keypress(function( event ){
        key_code = event.keyCode
        if (key_code === 10 || key_code === 13){
            event.preventDefault();
        }
    })

// add typing event handler
    $(input_selector).keyup(function( event ){
    
    // retrieve key code
        key_code = event.keyCode;

    // retrieve input value
        if ($(this).get(0).isContentEditable){
            input_value = $(this).text()
        } else {
            input_value = $(this).val()
        }

    // initiate callbacks
        if ((key_code == 10 || key_code == 13)){

            submit_callback(input_value)
        
        }

    })

// add focus out handler
    $(input_selector).focusout(function( event ){

    // retrieve input value
        if ($(this).get(0).isContentEditable){
            input_value = $(this).text()
        } else {
            input_value = $(this).val()
        }
        
        submit_callback(input_value)
    
    })
        
}

function errorDialog(error_message) {

/* a method to construct a dialog to report errors */

// define method variables
    var dialog_title = ''
    var dialog_message = ''
    
// construct regex map
    var error_patterns = {
        invalid: new RegExp(/Access token is invalid/g),
        missing: new RegExp(/Access token is missing/g)
    }
    
// handle missing token
    if (error_patterns.missing.test(error_message)){
       
        dialog_title = 'Token Missing'
        dialog_message = 'To access this content, an access token is required. You can register your access token, using the "Register Token" button in the menu panel.'
        openChat()
        
// handle invalid token
    } else if (error_patterns.invalid.test(error_message)){

        dialog_title = 'Token Invalid'
        dialog_message = 'The access token you have registered is not a valid token on record. Please double-check the value you have entered.'
        openChat()
        
// handle catchall
    } else {

        dialog_title = 'Request Error'
        dialog_message = error_message

    }
    
// construct dialog html
    const dialog_html = sprintf('\
        <div class="col-xs-12 margin-vertical-10">\
            <div class="form-text auto-height text-wrap">%s</div>\
        </div>',
        dialog_message
    )

// construct flexible dialog
    var dialog_options = {
        title: dialog_title,
        body: dialog_html
    }
    flexibleDialog(dialog_options)
    
}

function updateTitle(title_kwargs) {

/* a method for updating the title fields */

// declare input schema
    var input_schema = {
        'schema': {
            'app_title': 'Origins Project',
            'app_subtitle': 'Food Provenance powered by Blockchain',
            'page_title': 'Origins Project',
            'page_label': 'Food Provenance powered by Blockchain',
            'center_desktop': false
        },
        'metadata': {
            'example_statements': [ 'update the title fields' ]
        }
    }

// ingest arguments
    var title_dict = input_schema.schema
    unpackKwargs(title_kwargs, title_dict, 'updateTitle')

// change page title
    var title_parts = document.title.split(' : ')
    if (title_dict.app_title){
        title_parts[0] = title_dict.app_title
    }
    if (title_dict.app_subtitle){
        title_parts[1] = title_dict.app_subtitle
    }
    document.title = title_parts.join(' : ')

// change header title
    var header_ids = [ '#header_title_desktop_text', '#header_title_mobile_text' ]
    for (var i = 0; i < header_ids.length; i++) {
        header_id = header_ids[i]
        if (!title_dict.page_label) {
        $(header_id).removeAttr('title')
        } else {
            $(header_id).attr('title', title_dict.page_label)
        }
        $(header_id).text(title_dict.page_title)
    }

// toggle header center
    var desktop_title_id = '#header_title_desktop'
    if (title_dict.center_desktop){
        $(desktop_title_id).removeClass('navbar-start')
        $(desktop_title_id).addClass('navbar-center')
    } else {
        $(desktop_title_id).removeClass('navbar-center')
        $(desktop_title_id).addClass('navbar-start')
    }

}

function registerDialog() {

/* a method to construct a dialog with an access token input field */

// retrieve access token
    var access_token = ingestString(localStorage.getItem('access_token'))
    
// construct dialog html
    var token_value = ''
    if (access_token){ token_value = ' value="' + access_token + '"'}
    const dialog_html = sprintf('\
        <div class="form-line text-left">\
            <div class="col-xs-12 margin-bottom-10">\
                <div class="form-text auto-height text-wrap">Access Token:</div>\
            </div>\
            <div class="col-xs-12 margin-bottom-5">\
                <form title="Access Token">\
                    <div class="row">\
                        <div class="col-xs-12">\
                            <label for="access_token_input" class="sr-only">Access Token</label>\
                            <input id="access_token_input" type="text" autofocus class="form-input"%s>\
                        </div>\
                    </div>\
                </form>\
            </div>\
        </div>', 
        token_value
    )

// construct flexible dialog
    var dialog_options = {
        title: 'Register Token',
        body: dialog_html
    }
    flexibleDialog(dialog_options)

// construct selectors
    const background_selector = '#dialog_backdrop'
    const input_selector = '#access_token_input'
        
// define submission function
    function _token_submit(input_value){
        localStorage.setItem('access_token', input_value)
        $(background_selector).click()
    }
    
// add listeners
    registerHandler(input_selector, _token_submit)
    autofocusEnd(input_selector)
    
}

function openDocumentation(div_id='') {

// define documentation view
    function _open_documentation(doc_map){
        
    // toggle dashboard
        openDashboard()
    
    // replace title
        var title_kwargs = {
            app_title: window.app_title,
            app_subtitle: 'API Documentation',
            page_title: 'API Documentation',
            page_label: 'View API Documentation',
            center_desktop: true
        }
        updateTitle(title_kwargs)
        
    // toggle documentation container
        var record_key = 'documentation'
        var container_selector = '#documentation_container'
        var container_html = '<div id="documentation_container" class="container content-container-scroll"></div>'
        toggleView(container_selector, container_html)
    
    // inject doc map
        const doc_text = syntaxHighlight(JSON.stringify(doc_map, undefined, 2))
        const doc_html = '<pre class="text-wrap pre-json">' + doc_text + '</pre>'
        $(container_selector).html(doc_html)
        
    // scroll to div
        scrollDiv(div_id)
        
    }
    
// retrieve settings
    var access_token = ingestString()
    requestingResource({
        route: '/api/v1',
        method: 'GET'
    }).done(function(response){
        logConsole(response.schema)
        _open_documentation(response)
    })
    
}

function openSources(div_id='') {

// define documentation view
    function _open_sources(sources_map=null){
        
    // toggle dashboard
        openDashboard()
    
    // replace title
        var title_kwargs = {
            app_title: window.app_title,
            app_subtitle: 'Trusted Sources',
            page_title: 'Trusted Sources',
            page_label: 'Edit Trusted Sources',
            center_desktop: true
        }
        updateTitle(title_kwargs)
        
    // toggle documentation container
        var record_key = 'sources'
        var container_selector = '#sources_container'
        var container_html = '<div id="sources_container" class="container content-container-scroll"></div>'
        toggleView(container_selector, container_html)
    
    // toggle buttons
        $('#header_microphone').hide()
        $('#header_plus').show()
        $('#dialog_chat').hide()
        $('#microphone_button').off()
    
    // inject doc map
        var section_html = '<section id="sources_section" class="section-last"></section>'
        
        const doc_text = syntaxHighlight(JSON.stringify(sources_map, undefined, 2))
        const doc_html = '<pre class="text-wrap pre-json">' + doc_text + '</pre>'
        $(container_selector).html(doc_html)
        
    // scroll to div
        scrollDiv(div_id)
        
    }
    
// retrieve api data
    var access_token = ingestString(localStorage.getItem('access_token'))
    requestingResource({
        route: '/sources',
        method: 'GET',
        params: { 'token': access_token }
    }).done(function(response){
        logConsole(response)
        _open_sources(response.details)
    }).fail(function(error){
        errorDialog(error)
    })

}

function renderResponse(response) {

// ingest Response
    let details = response.details
    let new_message = ingestString(details.msg)
    let new_audio = ingestMap(details.audio)
    let new_content = ingestMap(details.content)
    var message_box_id = '#dialog_chat_message_box'

// render messages and audio
    if (new_message){
        updateConversation(message_box_id, new_message, message_html='', bot_name='Origins')
    }
    if (mapSize(new_audio)){
        playAudio(new_audio.audio_data, new_audio.content_type, new_audio.volume_level)
    }

// define attestation dialog constructor
    function _construct_attestations(claim_selector, attest_array, attesters_map) {
        
        const claim_id = claim_selector.slice(1)
        const attester_1 = ingestMap(attesters_map[attest_array[0]])
        const attester_2 = ingestMap(attesters_map[attest_array[1]])
        let popup_msg_html = sprintf('\
            <p class="form-label">Sources</p>\
            <p class="font-text">%s</p>\
            <p class="font-hyperlink no-wrap">%s</p>',
            attester_1.name, attester_1.web
        )
        
        if (attest_array.length > 1){
            popup_msg_html += sprintf('\
                <p class="font-text">%s</p>\
                <p class="font-hyperlink no-wrap">%s</p>',
                attester_2.name, attester_2.web
            )
        }
        
        const message_dict = {
            'anchor_selector': claim_selector,
            'message_html': popup_msg_html,
            'message_status': 'normal',
            'message_location': 'top'
        }
        
        $(claim_selector).click(function(){
            showMessage(message_dict)
        })
        const source_selector = '#dialog_status_message_' + claim_id
        setInterval(function(){
            $(source_selector).click(function(){
                hideMessage(claim_selector)
            })
        }, 1000)
         
    }
    
// render visual content
    if (mapSize(new_content)){
    
        let producer = new_content.producer
        let attesters = new_content.attesters
        
        let new_html = sprintf('\
            <div id="verify_report" class="row auto-height column-border">\
                <div class="col-xs-12 margin-top-10">\
                    <div class="form-label">Brand</div>\
                </div>\
                <div class="col-xs-12">\
                    <div class="font-text">%s</div>\
                </div>\
                <div class="col-xs-12 margin-top-10">\
                    <div class="row auto-height">\
                        <div class="col-xs-8">\
                            <div class="form-label">Claims</div>\
                        </div>\
                        <div class="col-xs-4 text-right">\
                            <div class="form-label">Sources</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="col-xs-12">\
                    <div class="row auto-height">\
                        <div class="col-xs-8">\
                            <div class="font-text text-wrap">%s</div>\
                        </div>\
                        <div class="col-xs-4 text-right">\
                            <a id="claim_a" class="font-green">2 of 3</a>\
                        </div>\
                    </div>\
                </div>\
                <div class="col-xs-12">\
                    <div class="row auto-height">\
                        <div class="col-xs-8">\
                            <div class="font-text text-wrap">%s</div>\
                        </div>\
                        <div class="col-xs-4 text-right">\
                            <a id="claim_b" class="font-gold">1 of 3</a>\
                        </div>\
                    </div>\
                </div>\
                <div class="col-xs-12 margin-bottom-10">\
                    <div class="row auto-height">\
                        <div class="col-xs-8">\
                            <div class="font-text text-wrap">%s</div>\
                        </div>\
                        <div class="col-xs-4 text-right">\
                            <a id="claim_c" class="font-red">0 of 3</a>\
                        </div>\
                    </div>\
                </div>\
            </div>',
            producer.name,
            producer.claims[0].desc,
            producer.claims[1].desc,
            producer.claims[2].desc
        )
        updateConversation(message_box_id, new_html, new_html).done(function(){
            _construct_attestations('#claim_a', producer.claims[0].attest, attesters)
            _construct_attestations('#claim_b', producer.claims[1].attest, attesters)
        })
        
    }
    
}

function toggleSpeech(activate=true) {

    /* a method to add / remove a socket channel interface */
    
// define input box selectors
    var record_key = 'dialog_chat'
    var input_box_id = '#dialog_chat_input_box'
    var submit_box_id = '#dialog_chat_submit_box'
    var message_box_id = '#dialog_chat_message_box'
    var transcript_box_id = '#' + record_key + '_transcript_box'
    var input_prefix = record_key + '_input'
    var submit_prefix = record_key + '_submit'
    var message_input_id = '#' + input_prefix + '_message_text'
    var message_submit_id = '#' + submit_prefix + '_message_success'
    var message_error_id = '#' + submit_prefix + '_message_error'

// define input constructor
    function _construct_message_input() { 
    
    // inject input form into conversation frame
        var input_html = sprintf('\
            <div id="%s_row" class="row">\
                <div id="%s_column" class="col-xs-12">\
                    <form id="%s_form" title="New Message">\
                        <div id="%s_form_row" class="row">\
                            <div id="%s_form_left" class="col-xs-12 auto-height">\
                                <textarea id="%s_message_text" placeholder="type message here..." class="form-input-textarea"></textarea>\
                            </div>\
                        </div>\
                    </form>\
                </div>\
            </div>',
            input_prefix, input_prefix, input_prefix, input_prefix, input_prefix, input_prefix)
        $(input_box_id).html(input_html)
    
    // inject submit button into conversation frame
        var submit_html = sprintf('\
            <div id="%s_row" class="row">\
                <div id="%s_column" class="col-xs-1 text-right">\
                    <div id="%s_text" class="form-text">\
                        <span id="%s_message_error" class="icon-ban icon-error icon-overlay" style="display: none;"></span>\
                        <span id="%s_message_success" class="icon-arrow-right-circle icon-success"></span>\
                    </div>\
                </div>\
            </div>',
            submit_prefix, submit_prefix, submit_prefix, submit_prefix, submit_prefix, submit_prefix)
        $(submit_box_id).html(submit_html)
    
    // add focus and autosize to input
        $(message_input_id).focus()
        autosize($(message_input_id))
    
    }
     
// define submit function    
    function _submit_message(input_value){
        
        requestingResource({
            route: '/query',
            method: 'POST',
            body: {
                type: 'message',
                text: input_value
            }
        }).done(function(response){
            logConsole(response)
            renderResponse(response)
        })
        updateConversation(message_box_id, input_value)
        $(message_input_id).val('')
        $(message_input_id).focus()
        autosize.update($(message_input_id))
        
    }

// define interim speech update function
    function _update_message(transcribed_text){
        $(message_input_id).val(transcribed_text)
        autosize.update($(message_input_id))
    }
        
// define final speech submit function
    function _submit_speech(transcribed_text){
        requestingResource({
            route: '/query',
            method: 'POST',
            body: {
                type: 'speech',
                text: transcribed_text
            }
        }).done(function(response){
            logConsole(response)
            renderResponse(response)
        })
        updateConversation(message_box_id, transcribed_text)
        $(message_input_id).val('')
        autosize.update($(message_input_id))
    }
    
// update socket channels and local environment
    if (activate){
        logConsole('Speech started.')
        startSpeechRecognition(_submit_speech, _update_message)
        if (!$.trim($(input_box_id).html())){
        // add messaging input bar
            _construct_message_input()
            inputHandler(message_input_id, 'Message', {}, _submit_message, enter_submit=true, auto_save=false)
            statusButtonHandler(message_input_id, message_error_id, message_submit_id, 'Message', {}, _submit_message)
        } else {
            $(message_input_id).focus()
        }
    } else {
        logConsole('Speech stopped.')
        stopSpeechRecognition()
        $(input_box_id).empty()
        $(submit_box_id).empty()
    } 

}

function openChat() {
    
// toggle dashboard
    openDashboard()
    
// replace title
    var title_kwargs = {
        center_desktop: true
    }
    updateTitle(title_kwargs)
    
// toggle documentation container
    var record_key = 'blank'
    var container_selector = '#blank_container'
    var container_html = '<div id="blank_container" class="container content-container-fill"></div>'
    toggleView(container_selector, container_html)

// show conversation dialog
    $('#header_microphone').show()
    $('#header_plus').hide()
    $('#dialog_chat').show()
    
// add listeners
    $('#microphone_button').click(function(){
        if ($('#microphone_burst').attr('class')){
            $('#microphone_burst').removeClass('burst-effect')
            toggleSpeech(activate=false)
        } else {
            $('#microphone_burst').addClass('burst-effect')
            toggleSpeech()
        }
    })

    
}

function openDashboard() {

// remove landing container
    $('#landing_container').remove()
    
// toggle dashboard
    $('.dashboard-view').each(function(i){
        if (!($(this).is(':visible'))){
            $(this).show()   
        }
    })
    $('.landing-view').each(function(i){
        if ($(this).is(':visible')){
            $(this).hide()
        }
    })
    $('.header-border').addClass('navbar-border')

}

function landingView() {

// inject html
    const content_id = '#content'
    const logo_button_id = '#logo_button'
    const landing_html = '\
        <div id="landing_container">\
            <div id="center_middle" class="center-middle">\
                <div class="burst-effect">\
                    <a id="logo_button"><img src="/public/images/logo.svg" class="icon-thumb"></a>\
                </div>\
            </div>\
        </div>'
    $(content_id).html(landing_html)

// toggle dashboard
    $('.dashboard-view').each(function(i){
        if ($(this).is(':visible')){
            $(this).hide()   
        }
    })
    $('.landing-view').each(function(i){
        if (!($(this).is(':visible'))){
            $(this).show()
        }
    })
    $('.header-border').removeClass('navbar-border')
    
// add listener
    $(logo_button_id).click(function(){
        openChat()
    })

}

function signOut() {

// clear records in local storage
    for (var i = 0; i < localStorage.length; ++i ) {
        var record_key = localStorage.key(i)
        localStorage.removeItem(record_key)   
    }
    logConsole('All records deleted from Local Storage.')

// stop recording
    stopSpeechRecognition()
    $('#dialog_chat').hide()
    $('#dialog_chat_message_box').empty()
    $('#dialog_chat_input_box').empty()
    $('#dialog_chat_submit_box').empty()
    $('#header_plus').hide()
    $('#header_microphone').hide()
    $('#microphone_button').off()
    $('#microphone_burst').removeClass('burst-effect')
    
// restore landing view
    landingView()
 
}

var device_handlers = {

// Handler Constructor
    initialize: function() {
    
        this.bindEvents();
        
    },
    
// Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
    },

// bind header functions
    bindHeaders: function() {
    
        // bind menu button
        $('#menu_button').click(function(){
            slideoutDialog('#dialog_menu', 'left')
        })
        
        // bind menu listeners
        menu_details = {
            "sections": [
                {
                  "actions": [
                    {
                      "icon": "icon-bubbles",
                      "name": "Verification",
                      "onclick": "openChat",
                      "label": "Open Verification Menu"
                    },
                    {
                      "icon": "icon-user",
                      "name": "Trusted Sources",
                      "onclick": "openSources",
                      "label": "View Trusted Sources List"
                    }
                  ]
                },
                {
                  "actions": [
                    {
                      "icon": "icon-key",
                      "name": "Register Token",
                      "onclick": "registerDialog",
                      "label": "Register an Access Token"
                    },
                    {
                      "icon": "icon-doc",
                      "name": "Documentation",
                      "onclick": "openDocumentation",
                      "label": "View API Documentation"
                    },
                    {
                      "icon": "icon-logout",
                      "name": "Sign-Out",
                      "onclick": "signOut",
                      "label": "Sign Out from Laboratory"
                    }
                  ]
                },
                {
                  "actions": [
                    {
                      "icon": "icon-social-twitter",
                      "name": "Twitter",
                      "onclick": "open",
                      "args": [ "https://twitter.com/CollectiveAcuit" ],
                      "label": "Open Twitter Page"
                    },
                    {
                      "icon": "icon-social-facebook",
                      "name": "Facebook",
                      "onclick": "open",
                      "args": [ "https://www.facebook.com/collectiveacuity/" ],
                      "label": "Open Facebook Page"
                    }
                  ]
                }
              ]
        }
        menuBindings(menu_details)
        
        // bind info button
        $('#info_button').click(function(){
            var mission_details = {
                title: "Mission",
                description: "Statement of purpose for the laboratory.",
                effective_date: "2016.05.31.13.45.55",
                author: "Collective Acuity",
                details: "To make accessible to each individual the resources of the world."
            }
            blockquoteDialog(mission_details)
        })
        
        // add scroll to top binding to header
        $('#header_title_text_mobile, #header_title_text_desktop').click(function () {
            $('html, body').animate({scrollTop: 0}, 500)
        })

    },
    
// deviceoffline event handler
    onDeviceOffline: function() {
        window.device_online = false  // used in record retrieval logic
        console.log('Device Offline')
    },
    
// deviceonline event handler
    onDeviceOnline: function() {
        window.device_online = true  //used for record retrieval logic
        console.log('Device Online')
    },

// window variable creation
    constructWindow: function() {
    
    // set app details
        window.device_online = true
        window.system_environment = 'dev'
        window.app_title = 'Origins Project'
        
    // set server url components
        window.server_protocol = location.protocol
        window.server_domain = document.domain
        window.server_port = location.port
    
    // set server url
        window.server_url = window.server_protocol + '//' + window.server_domain
        if (window.server_port){
            window.server_url += ':' + window.server_port
        }
    
    },

// load async libraries
    loadLibraries: function() {
    
    // construct new promise
        var deferred = new $.Deferred()
        var library_promises = []
    
    // call library imports
        deferred.resolve()
        
        return deferred.promise()
        
    },
      
// parse view to open
    openView: function() {
    
    // retrieve params
        var param_fields = retrieveParams()
        
    // construct initial view based upon params
        if ('view' in param_fields){
        
            var view = param_fields['view']
            var section = ''
            if ('section' in param_fields){
                section = param_fields['section']
            }
            if (view == 'documentation'){
                openDocumentation(section)
            }
            
    // default to landing view
        } else {
            if (!$.trim($('#content').html())) {
                landingView()
            }
        }
    
    },
    
// deviceready Event Handler
    onDeviceReady: function() {
        
    // construct window
        device_handlers.constructWindow()
        
    // bind view header listeners
        device_handlers.bindHeaders()
    
    // load async libraries
        device_handlers.loadLibraries()
        
    // open entry view
        device_handlers.openView()
    
    // add online and offline handlers
        document.addEventListener('offline', device_handlers.onDeviceOffline, false);
        document.addEventListener('online', device_handlers.onDeviceOnline, false);
                
    // log state
        console.log('Device Ready') 
    
    }

}

device_handlers.initialize();