# About #
A port of the [Cardiac Risk Visualization SMART Application](https://github.com/chb/smart_sample_apps/tree/0f8afd5036326f68cfb9bacf9d20d2bf3d5dd7ed/static/framework/cardio_risk_viz
) to use an [HL7 FHIR](http://www.hl7.org/implement/standards/fhir/index.htm) v0.10 data source for [lab reports](http://www.hl7.org/implement/standards/fhir/diagnosticreport.htm
) and [patient demographics](http://www.hl7.org/implement/standards/fhir/Patient.htm).

# Run Locally #

Fork this project locally. Setup a local web server and run it at:
* http://localhost:8000/cardiac-risk-app/
* http://localhost:8000/cardiac-risk-app/launch.html

You can use the following command to setup the webserver if you like:

```http-server -p 8000 /path/to/cardiac-risk-app/..```

At this point, you can now add the fhirServiceUrl endpoint to the app. If you are just starting out, you can use the [SmartHealthIt.org](http://docs.smarthealthit.org/tutorials/testing/) open sandbox api (you will need to setup an [account](https://service.smarthealthit.org/private/Login)).

To see the app running, go to your localhost webserver where the cardiac-risk-app project is and open up the launch.html file w/ the fhirServiceUrl endpoint so it looks like the following:

```http://localhost:8000/cardiac-risk-app/launch.html?fhirServiceUrl=https://fhir-open-api.smarthealthit.org&patientId=[insert patient ID number here]```


# Data Source #
The current data source is Grahame Grieve's HL7 FHIR [reference implementation](http://hl7connect.healthintersections.com.au/svc/fhir).

# Screenshot #

![Screenshot](https://raw.github.com/sethrylan/fhir_cardiac_risk/gh-pages/screenshot.png)
