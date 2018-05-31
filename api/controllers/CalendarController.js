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

var googleCalendarProvider = require('./../providers/CalendarProvider.js');
var fs = require('fs');
var moment = require('moment-timezone');

module.exports = {
    addEvent : addEvent,
    updateEvent : updateEvent,
    deleteEvent : deleteEvent
};

var event = {
    'summary': 'Test summary', 
    'location': 'Test location', 
    'description': 'Test description', 
    'start': {
        'dateTime': '2017-01-01T09:00:00-07:00', 
        'timeZone': 'America/Los_Angeles'
    }, 
    'end': {
        'dateTime': '2017-01-01T10:00:00-07:00', 
        'timeZone': 'America/Los_Angeles'
    },
    'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=1'
    ], 
    'attendees': [
        {
            'email': 'test@example.com'
        }
    ], 
    'reminders': {
        'useDefault': false, 
        'overrides': [
            {
                'method': 'email', 
                'minutes': 24 * 60
            }, 
            {
                'method': 'popup', 
                'minutes': 10
            }
        ]
    }
};

function addEvent(request, response) {

    event.summary = '';
    event.location = '';
    event.description = '';
    //event.attendees = '';
    var timezoneContinent = request.swagger.params.timezoneContinent.value || '';
    var timezoneCountry = request.swagger.params.timezoneCountry.value || '';

    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            response.json({message: err});
        }

        var con = JSON.parse(content);
        
        event.start.timeZone = timezoneContinent + "/" + timezoneCountry;
        event.end.timeZone = timezoneContinent + "/" + timezoneCountry;
        
        var date = new Date();
        date.setDate(date.getDate() + 1);
        var momentDate = moment(date);
        
        momentDate.tz(timezoneContinent + "/" + timezoneCountry);
        event.start.dateTime = momentDate.format();
        
        date.setHours(date.getHours() + 7);
        var momentDate = moment(date);
        momentDate.tz(timezoneContinent + "/" + timezoneCountry);
        event.end.dateTime = momentDate.format();

        googleCalendarProvider.authorize(con).then(function (res) {

            googleCalendarProvider.addEvent(res, event).then(function (res) {
                console.log(res.id);
                response.json({message: 'Successfully Added an Event. Calendar ID - ' + res.id});
            }).catch(function (err) {
                console.log(err);
                response.json({message: err});
            });

        }).catch(function (err) {
            console.log(err);
        });

    });

}


function updateEvent(request, response) {

    var calendarId = request.swagger.params.calendarId.value || '';

    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        var con = JSON.parse(content);

        googleCalendarProvider.authorize(con).then(function (res) {

            googleCalendarProvider.getEvent(res, calendarId).then(function (res1) {
                
                var date = new Date(res1.start.dateTime);
                date.setHours(date.getHours() + 2);
                res1.start.dateTime = date;
                
                date = new Date(res1.start.dateTime);
                date.setHours(date.getHours() + 7);
                res1.end.dateTime = date;
                
                googleCalendarProvider.updateEvent(res, res1, calendarId).then(function (res) {
                    response.json({message: 'Successfully Updated the Event'});
                }).catch(function (err) {
                    console.log(err);
                });
                
            }).catch(function (err) {
                console.log(err);
                response.json({message: err});
            });

        }).catch(function (err) {
            console.log(err);
        });

    });
}

function deleteEvent(request, response) {

    var calendarId = request.swagger.params.calendarId.value || '';

    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        var con = JSON.parse(content);

        googleCalendarProvider.authorize(con).then(function (res) {

            googleCalendarProvider.deleteEvent(res, calendarId).then(function (res1) {
                    
                response.json({message: 'Successfully Deleted the Event'});
                
            }).catch(function (err) {
                console.log(err);
                response.json({message: err});
            });

        }).catch(function (err) {
            console.log(err);
        });

    });
}