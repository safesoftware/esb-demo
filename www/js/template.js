workspaces = ["311PublicMessageLoader.fmw","UpdateDepartmentDB.fmw","311MessageDBsummary.fmw"]
repository = "311ESB";

window.onload = function() {

  FMEServer.init({
    server : "https://demos-safe-software.fmecloud.com",
    token : "568c604bc1f235bbe137c514e7c61a8436043070"

  });

  //Initialize WebSocket listener
  var ws = FMEServer.getWebSocketConnection('ESB');

	ws.onmessage = function (event) {
     var dt = new Date();
     var utcDate = dt.toUTCString();
     var message = "<p>" + utcDate + ":" + event.data + "</p>";
     $("#ws").append(message);
	};

  //loop through workspace array
  for (i = 0; i < workspaces.length; i++) {
    var workspace = workspaces[i];
    createForm(workspace);
  }

};

function createForm( workspace ) {

  var form = document.getElementById(workspace);

  FMEServer.getWorkspaceParameters( repository, workspace, populateForm);

  function populateForm( json ) {
    // Use the API to build the form items
    FMEServer.generateFormItems( workspace, json );

    // Add the custom submit button
    var button = document.createElement( "input" );
    button.type = "button";
    button.value = "Submit/Reload";
    button.setAttribute( "onclick", "submitJob('"+ workspace +"');" );
    form.appendChild( button );
  }
}



function showResults( json ) {
  // The following is to write out the full return object
  // for visualization of the example
  var workspace = form.id;
  var tableID = workspace+"_table";
  var hr = document.createElement( "hr" );
  var div = document.createElement( "div" );
  div.id = tableID;

  if (typeof json === "object") {
    json = "No entries";
    div.innerHTML = json;
  }
  else {
    div.innerHTML = json;
  };

  if (document.getElementById(tableID)) {
    document.getElementById(tableID).innerHTML = json;
  }
  else {
    document.getElementById(workspace).appendChild( hr );
    document.getElementById(workspace).appendChild( div );
  }

  //Select table row and use 9th column as value in other parameter
  $(".table tbody tr").click(function(){
  $(this).addClass('selected').siblings().removeClass('selected');
   var value=$(this).find('td:nth-child(9)').html();
   $("input[name=MessageID]").val(value);

});
};

function submitJob(workspace) {

  form = document.getElementById(workspace);
  // Loop through the form elements and build the publishedParameters array
  var params = "";
  for( var i = 0; i < form.length; i++ ){
    var element = form.elements[i];
    if( element.type == "select" ) {
      params += element.name+"="+element[element.selectedIndex].value+"&";
    } else if( element.type == "checkbox" ){
      if( element.checked ) {
          params += element.name+"="+element.value+"&";
      }
    } else {
      params += element.name+"="+element.value+"&";
    }
  }

  // Remove trailing & from string
  params = params.substr( 0, params.length - 1 );

  var workspace = workspace;
  // Submit Job to FME Server and run synchronously
  FMEServer.runDataStreaming( repository, workspace, params, showResults );
}

setTimeout(doSomething, 1000);

function doSomething(){

  $("#311MessageDBsummary\\.fmw span.db_connection.fmes-form-component select").prop("disabled", true);

  $("#UpdateDepartmentDB\\.fmw span.db_connection.fmes-form-component select").change(function() {
  var val = $(this).val();
  $('#311MessageDBsummary\\.fmw span.db_connection.fmes-form-component select option').each(function(){
    var val2 = $(this).html();
    if (val2 == val) {
      $(this).prop('selected', true);
    } else {
      $(this).prop('selected', false);
    }
  });
});
};
