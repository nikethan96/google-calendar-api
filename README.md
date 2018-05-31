
Author : Nikethan Selvanathan
Date : 07/01/2016

About -
	This is a Node application which will enable an user to add, update and delete event to a  particular Google Account's Calendar.(particular Google Account has to Authorize this app)

Walkthrough - 

	Go to Google Api for calendar page (https://developers.google.com/google-apps/calendar/quickstart/nodejs) and do the steps mentioned in Step 1: Turn on the Google Calendar API. 

	Edit the Calendar.js file in config folder with the gmail address and run the node app.

	Go google-calendar-api project root path in Terminal and type 
		npm install
		npm start OR swagger project start

	Now go to http://127.0.0.1:6001/api/swagger to access the Swagger file.

	To get swagger UI.
		Checkout the dist folder of the swagger-ui source code from Github.(https://github.com/swagger-api/swagger-ui/tree/master/dist).

		Now edit the index.html file and replace the pet store URL http://petstore.swagger.io/v2/swagger.json with our API spec URL : http://127.0.0.1:6001/api/swagger

		Now open the index.html in any browser.

Usage - 
	First make a curl call to http://localhost:6001/api/getAuthorizationURL and get Authorization URL for your google account.(From the URL you will get a Authorization code).

	Now make a curl call to http://localhost:6001/api/setAuthorization/ with your Authorization code got from the first curl call as an appended path value.

	Now you are been enable to create, update and delete Event to that particular Google Account which has been authorized.

		Create an Event - http://localhost:6001/api/addCalendarEntry/ ** with respective value asked in Swagger document

		Update and Event - http://localhost:6001/api/updateEvent/ ** with respective value asked in Swagger document

		Dalete and Event - http://localhost:6001/api/deleteEvent/ ** with respective value asked in Swagger document