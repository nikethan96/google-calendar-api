/**
* MIT License
*
* Copyright (c) 2018 Nikethan
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
// Author : Nikethan Selvanathan
// Date : 07/01/2016

'use strict';

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'parker-peter-calendar-token2.json';
var async = require("async");
var calendar = google.calendar('v3');
var request = require('request');
var gmailConfig = require('./../../config/Calendar.js');

var gmail = gmailConfig.gmail;

module.exports = {
    authorize : authorize,
    getNewToken : getNewToken,
    storeToken : storeToken,
    listEvents : listEvents,
    addEvent : addEvent,
    updateEvent : updateEvent,
    getEvent : getEvent,
    deleteEvent : deleteEvent,
    getAuthorizationURL : getAuthorizationURL,
    saveAuthorizationCode : saveAuthorizationCode
}; 

function authorize(credentials) {
    
    return new Promise(function (resolve, reject) {
        
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        // Check if we have previously stored a token.

        fs.readFile(TOKEN_PATH, function (err, token) {
            if (err) {
                getNewToken(oauth2Client).then(function (res) {
                    console.log('Got oauth2Client from method getNewToken');
                    return resolve(res);
                }).catch(function (err) {
                    console.log('Error grtting the oauth2Client');
                    return reject(err);
                });
            }else {
                oauth2Client.credentials = JSON.parse(token);

                oauth2Client.refreshAccessToken(function(err, tokens) {

                    // console.log('Got oauth2Client from file');

                    storeToken(tokens);

                    return resolve(oauth2Client);
                });

            }
        });
        
    });
}

function getNewToken(oauth2Client) {
    
    return new Promise(function (resolve, reject) {
        
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', 
            scope: SCOPES
        });

        console.log('Authorize this app by visiting this url: ', authUrl);

        var rl = readline.createInterface({
            input: process.stdin, 
            output: process.stdout
        });

        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return reject(err);
                }
                console.log("Authorize Success");
                oauth2Client.credentials = token;
                storeToken(token);
                return resolve(oauth2Client);
            });
        });
        
    });
}

function storeToken(token) {
    
    try {
        fs.mkdirSync(TOKEN_DIR);
    }catch (err) {
        
        if (err.code != 'EEXIST') {
            throw err;
        }

    }

    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);

}

function listEvents(auth) {
    
    return new Promise(function (resolve, reject) {
        
        //listing events
        calendar.events.list({
            auth: auth, 
            calendarId: 'primary', 
            timeMin: (new Date()).toISOString(), 
            maxResults: 10,
            singleEvents: true, 
            orderBy: 'startTime'
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return reject(err);
            }
            
            var events = response.items;
            
            if (events.length == 0) {
                console.log('No upcoming events found.');
                return resolve('No upcoming events found.');
            }else {
                console.log('Upcoming 10 events:');
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var start = event.start.dateTime || event.start.date;
                    console.log('%s - %s', start, event.summary);
                }
                return resolve(events);
            }
        });
        
    });
    
}

function addEvent(auth, event) {
    
    return new Promise(function (resolve, reject) {
        
        //creating event
        calendar.events.insert({
            auth: auth, 
            calendarId: 'primary', 
            resource: event
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return reject(err);
            }
            console.log('Event created: %s', event.htmlLink);
            return resolve(event);
        });
        
    });
    
}

function updateEvent(auth, event, calendarId) {

    return new Promise(function (resolve, reject) {
        
        var authorization = "Bearer " + auth.credentials.access_token;
        
        var options = {
            method: 'PUT',
            url: 'https://www.googleapis.com/calendar/v3/calendars/' + gmail + '/events/' + calendarId,
            headers: {
                'Authorization' : authorization,
                'Content-Type' : 'application/json'
            }
        };
        
        options.body = JSON.stringify(event);
 
        request(options, function (error, response, body) {
            console.log(body);
            
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                return resolve(info);
            }else{
                console.log(body);
                return reject("Error");
            }
        });
            
    });
    
}

function getEvent(auth, calendarId) {

    return new Promise(function (resolve, reject) {
        
        var authorization = "Bearer " + auth.credentials.access_token;
        
        var options = {
            method: 'GET',
            url: 'https://www.googleapis.com/calendar/v3/calendars/' + gmail + '/events/' + calendarId,
            headers: {
                'Authorization' : authorization
            }
        };
 
        request(options, function (error, response, body) {
            
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                return resolve(info);
            }else{
                console.log(body);
                return reject("Error");
            }
        });
            
    });
    
}

function deleteEvent(auth, calendarId) {

    return new Promise(function (resolve, reject) {
        
        var authorization = "Bearer " + auth.credentials.access_token;
        
        var options = {
            method: 'DELETE',
            url: 'https://www.googleapis.com/calendar/v3/calendars/' + gmail + '/events/' + calendarId,
            headers: {
                'Authorization' : authorization
            }
        };
 
        request(options, function (error, response, body) {

            if (!error && response.statusCode == 204) {
                return resolve("Success");
            }else{
                console.log(body);
                return reject("Error");
            }
        });
            
    });
    
}

function getAuthorizationURL(credentials) {
    
    return new Promise(function (resolve, reject) {
        
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', 
            scope: SCOPES
        });

        console.log('Authorize this app by visiting this url: ', authUrl);
        
        return resolve(authUrl);
        
    });
}

function saveAuthorizationCode(credentials, code) {
    
    return new Promise(function (resolve, reject) {
        
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return reject(err);
            }
            console.log("Authorization Success");
            storeToken(token);
            return resolve("Success");
        });

    });
}