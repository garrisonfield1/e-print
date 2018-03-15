// user + team member info
var digest; // token used in all api calls
var currentUser = {}; // object - currentUser = user submitting order
var submitterUserList = []; // array - submitterUserList = array that holds alternate users of submitting user
var displayedProfileID; // string - used to identify what alternate user profile is being displayed
var displayedProfileArrayNum;
var userListLength = submitterUserList.length;

// shopping cart info
var productContent = {}; //object used to create URL and 
var cartItem = {};	// individual item in cart includeds Order ID
var shoppingCart = []; // Array that holds all items in cart
var displayedCartID; 	// string - used to identify what order # is being displayed
var displayedCartArrayNum; 	// string - used to identify the array element associated with  order # 
var cartLength;
var itemsInCart = 0;
var customOrderPrice = 0;
var customOrderPriceTotal = 0;
var subTotal = 0;

// API info
var body; // object - var used in submission of API data
var successElement; // string - either 'created' or 'updated' dependent upon if user has a record in SP list
var verbage; // string - used in sucess message for user create / update

// URL capture to call functions
var windowLocation = window.location;
var cartTotal = 0;
var productIdFromURL = window.location.search.replace('?ID=', '');
var url =  window.location.href.split('?')[0];

/* ----------------------------  Get Current User ---------------------------- */

function GetCurrentUser() {

    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
        var clientContext;
        clientContext = new SP.ClientContext.get_current();
        this.oWebsite = clientContext.get_web();
        this.oWebsite.set_enableMinimalDownload(true);
        this.oWebsite.update();

        clientContext.load(this.oWebsite);

        clientContext.executeQueryAsync(
            Function.createDelegate(this, successHandler),
            Function.createDelegate(this, errorHandler)
        );

        function successHandler() {
            //console.log("MDS is enabled in this site.");
        }

        function errorHandler() {
            console.log("Request failed: " + arguments[1].get_message());
        }
    });

    var requestUri = "../_api/web/currentUser";
    var requestHeaders = {
        "accept": "application/json;odata=verbose"
    };
    $.ajax({
        url: requestUri,
        contentType: "application/json;odata=verbose",
        headers: requestHeaders,
        async: false,
        success: function(data, request) {
            var userNameLastFirst = data.d.Title;
            var newString = userNameLastFirst.substr(0, userNameLastFirst.indexOf(','));
            var newString2 = userNameLastFirst.substr(userNameLastFirst.indexOf(",") + 2);
            currentUser.submitterName = (newString2 + " " + newString).trim();
            currentUser.submitterEmail = data.d.Email;
			currentUser.UserName = currentUser.submitterName;
			
            $("#ManualAuthor").val(currentUser.submitterName);

            /* assign user info to flyout menu & contact us form */
            userIDflyoutMenu();
            contactUsFormAutoFill();
            editProfileFormAutoFill();
            
            return currentUser;
        },
        error: function(error) {}
    });
}

/* ---------------------------- Get Security Token / aka Digest  ---------------------------- */

function getDigest(x, y) {
    var requestUri = "../_api/contextinfo";
    $.ajax({
        url: requestUri,
        type: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
        },
        success: function(data) {
            digest = data.d.GetContextWebInformation.FormDigestValue
            if (y != null) {
                x(y);
            } else {
                if (x != null) {
                    x();
                } else {}
            }
        },
        error: function(error) {}
    });
}

/* --------------------------| Route to Catalog  |---------------------------- */

function goToCatalog()
{
//	Initially navigated to Catalog page for more options.
//	Changed to Custom-Product.aspx for launch since no other fuctions are active.
//	Revert back to Catalog.aspx once additional functionality is added for Phase 2

//	var url = "https://soco365.sharepoint.com/sites/E-Print/Pages/Catalog.aspx";
	var url = "https://soco365.sharepoint.com/sites/E-Print/Pages/Custom-Product.aspx";
	
	try
	{
		uploadFile(url);
	}
	
	catch(err)
	{
		console.log("Caught an error on goToCatalog().");
		alert("Err in processing request.\n" + err.message);
	}

}

/* --------------------------| Route to Checkout  |---------------------------- */

function goToCart()
{
	var url = "https://soco365.sharepoint.com/sites/E-Print/Pages/ShoppingCart.aspx";
	try
	{
		uploadFile(url);	
	}
	
	catch(err)
	{
		console.log("Caught an error on goToCart().");
		alert("Err in processing request.\n" + err.message);
	}
}

/* --------------------------] Navigation Callback [------------------------- */

function navCallBack(url, callback)
{
	location.href = url;
	callback;
}

/* --------------------------| Redirect Away from ePrint  |---------------------------- */

function redirect()
{

	window.location.replace("https://soco365.sharepoint.com/sites/E-Print/Pages/disclaimer.aspx");
/*	
	document.write("You will be redirected to ePrint 1.0 in three seconds....");
	var btn = document.createElement("BUTTON");
	var label = document.createTextNode("Continue");
	btn.id = "redirectBtn";
	btn.onclick = function(){
		window.location.replace("https://www.google.com");
		return false;
//		location.assign("https://www.google.com");
	};
	btn.appendChild(label);
	document.body.appendChild(btn);
*/	
/*	
	setTimeout(function(){
		window.location = "https://www.google.com";
		return false;
		}, 3000);

*/
//	setTimeout(function(){location.assign("https://www.google.com")}, 3000);
}

/* ---------------------------- Carousel Rotator   ---------------------------- */

function ePrintRotator() {
    //News Rotator
    $.ajax({
		url: "../_api/lists/getbytitle('Main Rotator')/items?$filter=Status eq 'Active'",
//        url: "../_api/lists/getbytitle('Main Rotator')/items?$top=3",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function(data) {
            $.each(data.d.results, function(index, item) {
                var ImageURL = item.Image;
                var Title = item.Title;
                var Description = item.Description_x0020_Text;
                var Order = item.Order0;
/* Commented out current URL to navigate traffic to redirect until ePrint 2.0 is complete.  Uncomment to restore.  */
                // var URL = item.URL;
				var URL = "https://soco365.sharepoint.com/sites/E-Print/Pages/ePrintRedirect.aspx";
                var status = item.Status;

                if (status == "Active") {

                    if (Order == "1") {
                        $('.carousel-inner').append("<div class='item active carouselDiv'><img src='" + ImageURL + "' class='carouselImg'><div class='carousel-caption'><h3>" + Title + "</h3><p>" + Description + "</p><a href=" + URL + " class='btn redirect'>Order Now</a></div></div>");

                    }
                    if (Order == "2") {
                        $('.carousel-inner').append("<div class='item carouselDiv'><img src='" + ImageURL + "' class='carouselImg'><div class='carousel-caption'><h3>" + Title + "</h3><p>" + Description + "</p><a href=" + URL + " class='btn redirect'>Order Now</a></div></div>");

                    }
                    if (Order == "3") {
                        $('.carousel-inner').append("<div class='item carouselDiv'><img src='" + ImageURL + "' class='carouselImg'><div class='carousel-caption'><h3>" + Title + "</h3><p>" + Description + "</p><a href=" + URL + " class='btn redirect'>Order Now</a></div></div>");
                    }
                }
            });
        },
        error: function(error) {}
    });
} //End News Rotator

/* ---------------------------- Product Info to Product pages / show hide input elements ---------------------------- */

function productPageDisplay() {
   
    // default all checkboxes to checked
    $('#product-customize').find('input[type=checkbox]').prop("checked", true);
    $.ajax({
        url: "../_api/lists/getbytitle('Products')/items",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function(data) {
            $.each(data.d.results, function(index, item) {
                var ProductID = item.ID;
                var ImageURL = item.Image;
                var Title = item.Title;
                var Description = item.Description;
                var Specifications = item.Specifications;
                var FAQ = item.FAQ;
                var New = item.New;
                var Active = item.Active;


                if (productIdFromURL == ProductID) {
                    // Header + Image + Tab info                                                      
                    $('.product-page-title h1, .breadcrumbs span').append(Title);
                    $('.product-image-hero').append("<img src=" + ImageURL + " / alt=" + Title + ">");
                    $('#productDescriptionTabs').append("<div role='tabpanel' class='tab-pane fade in active' id='description'>" + Description + "</div>");
                    $('#productDescriptionTabs').append("<div role='tabpanel' class='tab-pane fade in' id='specifications'>" + Specifications + "</div>");
                    $('#productDescriptionTabs').append("<div role='tabpanel' class='tab-pane fade in' id='faq'>" + FAQ + "</div>");

                    // Show & Hide Form Inputs based on what product
                    if (Title == 'Business Cards - Standard' || Title == 'Business Cards - Executive') {
                        // add class to product viewer to show/hide boxes                        
                        $(".product-viewer").addClass('businessCard');
                        // uncheck the hidden boxes 
                        $('#product-customize').find('div').each(function() {
                            if ($(this).css("display") == "none") {
                                $(this).find('input[type=checkbox]').prop("checked", false);
                            }
                        });
                    } else if (Title == 'Letterhead - Standard' || Title == 'Letterhead - Executive') {
                        // add class to product viewer to show/hide boxes
                        $(".product-viewer").addClass('letterhead');
                        $('#divWrapPagerInput, #divWrapEmailInput').hide();
                        $('#pagerDisplay, #emailDisplay').hide();
                        // uncheck the hidden boxes 
                        $('#product-customize').find('div').each(function() {
                            if ($(this).css("display") == "none") {
                                $(this).find('input[type=checkbox]').prop("checked", false);
                            }
                        });
                    } else if (Title == 'Envelopes') {
                        // add class to product viewer to show/hide boxes                        
                        $(".product-viewer").addClass('envelopes');
                        $('#divWrapTitleInput, #divWrapDeptInput, #divWrapEmailInput, #divWrapPhoneInput, #divWrapCellInput, #divWrapFaxInput, #divWrapPagerInput').hide();
                        $('#titleDisplay, #deptDisplay, #phoneDisplay, #faxDisplay, #cellDisplay, #pagerDisplay, #emailDisplay').hide();
                        // uncheck the hidden boxes 
                        $('#product-customize').find('div').each(function() {
                            if ($(this).css("display") == "none") {
                                $(this).find('input[type=checkbox]').prop("checked", false);
                            }
                        });
                    } else if (Title == 'Flat Note Card' || Title == 'Flat Note Card - Executive') {
                        // add class to product viewer to show/hide boxes
                        $(".product-viewer").addClass('flatNoteCard');
                        // Hide input boxes & checkboxes that aren't used with product
                        $('#divWrapTitleInput, #divWrapDeptInput, #divWrapEmailInput, #divWrapPhoneInput, #divWrapCellInput, #divWrapFaxInput, #divWrapPagerInput, #divWrapBinInput, #divWrapAdd1Input, #divWrapAdd2Input, #divWrapLincInput, #divWrapBusinessUnitInput').hide();
                        // Hide product visualizer diplay info that's not used with product
                        $('#titleDisplay, #deptDisplay, #phoneDisplay, #faxDisplay, #cellDisplay, #pagerDisplay, #emailDisplay, #binDisplay, #address1Display, #address2Display').hide();
                        if(Title == 'Flat Note Card'){
                            $('#divWrapNameInput, #message').hide();   
                        }
                        // uncheck the hidden boxes 
                        $('#product-customize').find('div').each(function() {
                            if ($(this).css("display") == "none") {
                                $(this).find('input[type=checkbox]').prop("checked", false);
                            }
                        });
                    } else if (Title == 'Foldover Note Card' || Title == 'Foldover Note Card - Executive') {
                        // add class to product viewer to show/hide boxes
                        $(".product-viewer").addClass('foldoverNoteCard');
                        // Hide input boxes & checkboxes that aren't used with product
                        $('#divWrapTitleInput, #divWrapDeptInput, #divWrapEmailInput, #divWrapPhoneInput, #divWrapCellInput, #divWrapFaxInput, #divWrapPagerInput, #divWrapBinInput, #divWrapAdd1Input, #divWrapAdd2Input, #divWrapLincInput, #divWrapBusinessUnitInput').hide();
                        // Hide product visualizer diplay info that's not used with product
                        $('#titleDisplay, #deptDisplay, #phoneDisplay, #faxDisplay, #cellDisplay, #pagerDisplay, #emailDisplay, #binDisplay, #address1Display, #address2Display').hide();
                        if(Title == 'Foldover Note Card'){
                            $('#divWrapNameInput, #message').hide();   
                        }                        
                        // uncheck the hidden boxes 
                        $('#product-customize').find('div').each(function() {
                            if ($(this).css("display") == "none") {
                                $(this).find('input[type=checkbox]').prop("checked", false);
                            }
                        });
                    } else if (Title == 'Memo Pad 3x5' || Title == 'Memo Pad 3x5 - Executive' 
                                ||Title == 'Memo Pad 4x6' || Title == 'Memo Pad 4x6 - Executive'
                                ||Title == 'Memo Pad 5.5x8.5' || Title == 'Memo Pad 5.5x8.5 - Executive') {
                        // add class to product viewer to show/hide boxes
                        $(".product-viewer").addClass('memoPad');
                        // Hide input boxes & checkboxes that aren't used with product
                        $('#divWrapTitleInput, #divWrapDeptInput, #divWrapEmailInput, #divWrapPhoneInput, #divWrapCellInput, #divWrapFaxInput, #divWrapPagerInput, #divWrapBinInput, #divWrapAdd1Input, #divWrapAdd2Input, #divWrapLincInput, #divWrapBusinessUnitInput').hide();
                        // Hide product visualizer diplay info that's not used with product
                        $('#titleDisplay, #deptDisplay, #phoneDisplay, #faxDisplay, #cellDisplay, #pagerDisplay, #emailDisplay, #binDisplay, #address1Display, #address2Display').hide();
                        if(Title == 'Memo Pad 3x5' || Title == 'Memo Pad 4x6' || Title == 'Memo Pad 5.5x8.5'){
                            $('#divWrapNameInput, #message').hide();   
                        }                        
                        // uncheck the hidden boxes 
                        $('#product-customize').find('div').each(function() {
                            if ($(this).css("display") == "none") {
                                $(this).find('input[type=checkbox]').prop("checked", false);
                            }
                        });
                    } 
                }
            });
        },
        error: function(error) {
            console.log('Error ');
        }
    });
}

/* ---------------------------- Add User To Profile Form Submittal  ---------------------------- */

function submitAUser() {
    // adds values to user object
    currentUser.userName = $("#profileFormUserName").val();
    currentUser.userPhone = $("#profileFormUserPhone").val();
    currentUser.userFax = $("#profileFormUserFax").val();
    currentUser.userLinc = $("#profileFormUserLinc").val();
    currentUser.userTitle = $("#profileFormUserJobTitle").val();
    currentUser.userEmail = $("#profileFormUserEmail").val();
    currentUser.userAdd1 = $("#profileFormUserAddress1").val();
    currentUser.userAdd2 = $("#profileFormUserAddress2").val();
    currentUser.userPager = $("#profileFormUserPager").val();
    currentUser.userCell = $("#profileFormUserCell").val();
    currentUser.userOpco = $("#profileFormOpco option:selected").text();
    currentUser.userBusUnit = $("#profileFormUserBusUnit").val();
    currentUser.userDept = $("#profileFormUserJobDept").val();
    currentUser.userAcctNum = $("#profileFormUserAcctNum").val();
    currentUser.userBin = $("#profileFormUserBin").val();
    currentUser.userRCN = $("#profileFormUserRCN").val();
    currentUser.userCT = $("#profileFormUserCT").val();
    currentUser.userFERCSUB = $("#profileFormUserFERCSUB").val();
    currentUser.userActivity = $("#profileFormUserActivity").val();
    currentUser.userEWO = $("#profileFormUserEWO").val();
    currentUser.userRRCN = $("#profileFormUserRRCN").val();
    currentUser.userProject = $("#profileFormUserProject").val();
    currentUser.userLocation = $("#profileFormUserLocation").val();
    successElement = $('.userProfileAddSuccess');

    body = "{ '__metadata': { 'type': 'SP.Data.User_x0020_ProfilesListItem' },'Title': 'Person', 'Submitter': '" + currentUser.submitterName + "', 'SubmitterEmail': '" + currentUser.submitterEmail + "',  'UserName': '" + currentUser.userName + "', 'UserPhone': '" + currentUser.userPhone + "', 'UserFax': '" + currentUser.userFax + "',  'UserLinc': '" + currentUser.userLinc + "', 'UserTitle': '" + currentUser.userTitle + "',  'UserAddress1': '" + currentUser.userAdd1 + "',  'UserAddress2': '" + currentUser.userAdd2 + "',  'UserPager': '" + currentUser.userPager + "', 'UserCell': '" + currentUser.userCell + "',  'UserBusUnit': '" + currentUser.userBusUnit + "',  'UserDept': '" + currentUser.userDept + "', 'UserAcctNum': '" + currentUser.userAcctNum + "',  'UserBin': '" + currentUser.userBin + "', 'UserEmail': '" + currentUser.userEmail + "', 'RCN': '" + currentUser.userRCN + "', 'CT': '" + currentUser.userCT + "', 'FercSub': '" + currentUser.userFERCSUB + "', 'Activity': '" + currentUser.userActivity + "', 'EWO': '" + currentUser.userEWO + "', 'RRCN': '" + currentUser.userRRCN + "', 'Project': '" + currentUser.userProject + "','Location': '" + currentUser.userLocation + "', 'UserOpco': '" + currentUser.userOpco + "' }";

    //if user object has value, update SP list with new form values

    if (currentUser.hasRecord) {
        $.ajax({
            url: "../_api/web/lists/getbytitle('User Profiles')/items(" + currentUser.id + ")",
            type: "POST",
            success: onSuccess,
            error: onError,
            data: body,
            headers: {
                "X-RequestDigest": digest,
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            }
        });

        function onSuccess(data, request) {
            verbage = 'updated';
            profileUserAdded(successElement, verbage, currentUser.submitterName);
            userFormPopulator();
        }

        function onError(error) {
            console.log('Error updating user info within submitAUser() = ' + error);
        }

        //if user object is empty create SP list item with form values
    } else {
        $.ajax({
            url: "../_api/lists/getbytitle('User Profiles')/items?",
            type: "POST",
            success: onSuccess,
            error: onError,
            data: body,
            headers: {
                "X-RequestDigest": digest,
                "content-type": "application/json;odata=verbose",
            }
        });

        function onSuccess(data, request) {
            verbage = 'created';
            profileUserAdded(successElement, verbage, currentUser.submitterName);
            currentUser.hasRecord = true;
            userFormPopulator();
            window.location.reload(false);
        }

        function onError(error) {
            console.log('Error at submitAUser() = ' + error.error);
        }
    }
}

/* ---------------------------- Add Teammember To Profile Form Submittal  ---------------------------- */

function submitATeamMember() {
    var profile = {};
    profile.userName = $("#altCustUserName").val();
    profile.userPhone = $("#altCustUserPhone").val();
    profile.userFax = $("#altCustUserFax").val();
    profile.userLinc = $("#altCustUserLinc").val();
    profile.userTitle = $("#altCustUserJobTitle").val();
    profile.userEmail = $("#altCustUserEmail").val();
    profile.userAdd1 = $("#altCustUserAddress1").val();
    profile.userAdd2 = $("#altCustUserAddress2").val();
    profile.userPager = $("#altCustUserPager").val();
    profile.userCell = $("#altCustUserCell").val();
    profile.userOpco = $("#altCustOpco option:selected").text();
    profile.userBusUnit = $("#altCustUserBusUnit").val();
    profile.userDept = $("#altCustUserJobDept").val();
    profile.userAcctNum = $("#altCustUserAcctNum").val();
    profile.userRCN = $("#altCustUserRCN").val();
    profile.userCT = $("#altCustUserCT").val();
    profile.userFERCSUB = $("#altCustUserFERCSUB").val();
    profile.userActivity = $("#altCustUserActivity").val();
    profile.userEWO = $("#altCustUserEWO").val();
    profile.userRRCN = $("#altCustUserRRCN").val();
    profile.userProject = $("#altCustUserProject").val();
    profile.userLocation = $("#altCustUserLocation").val();
    successElement = $('.teamMemberProfileAddSuccess');

    body = "{ '__metadata': { 'type': 'SP.Data.User_x0020_ProfilesListItem' },'Title': 'Person', 'Submitter': '" + currentUser.submitterName + "', 'SubmitterEmail': '" + currentUser.submitterEmail + "',  'UserName': '" + profile.userName + "', 'UserPhone': '" + profile.userPhone + "', 'UserFax': '" + profile.userFax + "',  'UserLinc': '" + profile.userLinc + "', 'UserTitle': '" + profile.userTitle + "',  'UserAddress1': '" + profile.userAdd1 + "',  'UserAddress2': '" + profile.userAdd2 + "',  'UserPager': '" + profile.userPager + "', 'UserCell': '" + profile.userCell + "',  'UserBusUnit': '" + profile.userBusUnit + "',  'UserDept': '" + profile.userDept + "', 'UserAcctNum': '" + profile.userAcctNum + "',  'UserBin': '" + profile.userBin + "', 'UserEmail': '" + profile.userEmail + "', 'RCN': '" + profile.userRCN + "', 'CT': '" + profile.userCT + "', 'FercSub': '" + profile.userFERCSUB + "', 'Activity': '" + profile.userActivity + "', 'EWO': '" + profile.userEWO + "', 'RRCN': '" + profile.userRRCN + "', 'Project': '" + profile.userProject + "', 'Location': '" + profile.userLocation + "'}";

    userListLength = submitterUserList.length;
    displayedProfileID = $('#hiddenIDDisplay').val();
    //if submitterUserList array is empty, || or if select box is empty - create new user ... 
    if (!userListLength || !displayedProfileID) {
        $.ajax({
            url: "../_api/lists/getbytitle('User Profiles')/items?",
            type: "POST",
            success: onSuccess,
            error: onError,
            data: body,
            headers: {
                "X-RequestDigest": digest,
                "content-type": "application/json;odata=verbose",
            }
        });

        function onSuccess(data, request) {
            verbage = 'created';
            profileUserAdded(successElement, verbage, profile.userName);
            window.location.reload(false);
        }

        function onError(error) {
            console.log('Error = ' + error);
        }

        //if user submitterUserList array has content, update user ID in SP list item with form values
    } else {
        for (var i = 0; i < userListLength; i++) {
            if (submitterUserList[i].id == displayedProfileID) {
                $.ajax({
                    url: "../_api/web/lists/getbytitle('User Profiles')/items(" + submitterUserList[i].id + ")",
                    type: "POST",
                    success: onSuccess,
                    error: onError,
                    data: body,
                    headers: {
                        "X-RequestDigest": digest,
                        "content-type": "application/json;odata=verbose",
                        "IF-MATCH": "*",
                        "X-HTTP-Method": "MERGE"
                    }
                });

                function onSuccess(data, request) {
                    verbage = 'updated';
                    profileUserAdded(successElement, verbage, profile.userName);
                    userFormPopulator();
                }

                function onError(error) {
                    console.log('Error updating user info within submitAUser() = ' + error);
                }
            }
        } //for                      
    } //else    
}

/* ---------------------------- Alert Message for User Creation / User Update and clear form  ---------------------------- */

function profileUserAdded(element, content, name) {
    element.append(name + '\'s profile has been ' + content + '.');
    element.css("display", "block");
    element.fadeOut(8000, "fast", function() {
        element.empty();
    });
}

function clearProfileUser(element) {
    element.find('input').val('');
    element.find('select').val('Georgia Power');
}

/* ---------------------------- Populate User Informaion on Product page  ---------------------------- */

function userFormPopulator() {

    // is new order or modification of existing order
    displayedCartArrayNum = sessionStorage.getItem("displayedCartArrayNum");
    if (!displayedCartArrayNum || displayedCartArrayNum == '') {
        $('#updateOrderWarning, #cancelUpdate').hide();
        $('#addToCart').html('Add To Cart');
    } else if (displayedCartArrayNum >= 0) {
        $('#updateOrderWarning').html('Currently Editing Shopping Cart Order');
        $('#addToCart').html('Update Order');
        $('#updateOrderWarning, #cancelUpdate').show();

    }

    $.ajax({
        url: "../_api/lists/getbytitle('User Profiles')/items",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function(data) {

            // clear edit user dropdown as duplicates were happening 
            $('#editProfileFormTeamMember').find('option').remove();
            $('#productFormTeamMember, #editProfileFormTeamMember').append("<option value='0'>Ordering for another user? </option>");
            // clear submitterUserList[] array 
            submitterUserList = [];

            $.each(data.d.results, function(index, item) {
                var ID = item.ID;
                var submitter = item.Submitter;
                var submitterEmail = item.SubmitterEmail;
                var name = item.UserName;
                var title = item.UserTitle;
                var department = item.UserDept;
                var email = item.UserEmail;
                var phone = item.UserPhone;
                var cell = item.UserCell;
                var fax = item.UserFax;
                var pager = item.UserPager;
                var bin = item.UserBin;
                var address1 = item.UserAddress1;
                var address2 = item.UserAddress2;
                var linc = item.UserLinc;
                var busUnit = item.UserBusUnit;
                var opco = item.UserOpco;
                var accNum = item.UserAcctNum;
                var rcn = item.RCN;
                var ct = item.CT;
                var fercSub = item.FercSub;
                var activity = item.Activity;
                var ewo = item.EWO;
                var rrcn = item.RRCN;
                var project = item.Project;
                var location = item.Location;
                
                // Does user have a profile                                                                                                          
                if (email == currentUser.submitterEmail) {
                    currentUser.hasRecord = true;
                    userInfoToGlobal(title, department, phone, cell, fax, pager, bin, address1, address2, linc, busUnit, accNum, ID, rcn, ct, fercSub, activity, ewo, rrcn, project, location );                 
                    $('#productFormUserName, #profileFormUserName').val(name);
                    $('#nameDisplay').html(name);
                    $('#productFormUserEmail, #profileFormUserEmail').val(email);
                    $('#emailDisplay').html(email);
                    $('#productFormUserJobTitle, #profileFormUserJobTitle').val(title);
                    $('#titleDisplay').html(title);
                    $('#productFormUserJobDept,#profileFormUserJobDept').val(department);
                    $('#deptDisplay').html(department);
                    $('#productFormUserPhone, #profileFormUserPhone').val(phone);
                    $('#phoneDisplay').html(phone + ' tel');
                    $('#productFormUserCell, #profileFormUserCell').val(cell);
                    $('#cellDisplay').html(cell + ' cell');
                    $('#profileFormOpco, #altCustUserOpco').val(opco);
                    $('#productFormUserFax, #profileFormUserFax').val(fax);
                    $('#faxDisplay').html(fax + ' fax');
                    $('#productFormUserPager, #profileFormUserPager').val(pager);
                    $('#pagerDisplay').html(pager + ' ');
                    $('#productFormUserBin, #profileFormUserBin').val(bin);
                    $('#binDisplay').html(bin + ' BIN');
                    $('#productFormUserAddress1, #profileFormUserAddress1').val(address1);
                    $('#address1Display').html(address1);
                    $('#productFormUserAddress2, #profileFormUserAddress2').val(address2);
                    $('#address2Display').html(address2);
                    $('#productFormUserLinc, #profileFormUserLinc').val(linc);
                    $('#lincDisplay').html(linc + ' radio');
                    $('#productFormBusinessUnit, #profileFormUserBusUnit').val(busUnit);
                    $('#businessUnitDisplay').html(busUnit);
                    $('#profileFormUserAcctNum').val(accNum);
                    // payment fields
                    $('#profileFormUserRCN, #paymentFormRCN, #productFormRCN').val(rcn);
                    $('#profileFormUserCT, #paymentFormCT, #productFormCT').val(ct);
                    $('#profileFormUserFERCSUB, #paymentFormFERCSUB, #productFormFERCSUB').val(fercSub);
                    $('#profileFormUserActivity, #paymentFormActivity, #productFormActivity').val(activity);
                    $('#profileFormUserEWO, #paymentFormEWO, #productFormEWO').val(ewo);
                    $('#profileFormUserRRCN, #paymentFormRRCN, #productFormRRCN').val(rrcn);
                    $('#profileFormUserProject, #paymentFormProject, #productFormProject').val(project);
                    $('#profileFormUserLocation, #paymentFormLocation, #productFormLocation').val(location);

                    // add user to Team Member select box
                    $('#productFormTeamMember, #editPaymentForm').append("<option value='" + ID + "'>" + name + "</option>");

                }
                // Has user created profile for others                                                                                                                                     
                if (submitterEmail == currentUser.submitterEmail && email !== currentUser.submitterEmail) {

                    teamMembersToGlobal(name, email, title, department, phone, cell, fax, pager, bin, address1, address2, linc, busUnit, accNum, ID, rcn, ct, fercSub, activity, ewo, rrcn, project, location);

                    // add created users to Team Member select box
                    $('#productFormTeamMember, #editProfileFormTeamMember, #editPaymentForm').append("<option value='" + ID + "'>" + name + "</option>");
                }

            });
            // update length of submitterUserList[]
            userListLength = submitterUserList.length;
            //console.log('userFormPopulator() submitterUserList.length = ' + userListLength);                                                
            return name;
        },
        error: function(error) {
            console.log('Error ');
        }
    });

};


function cancelOrderUpdate() {
    displayedCartArrayNum = '';
    sessionStorage.setItem('displayedCartArrayNum', '');
    window.location = 'ShoppingCart.aspx';
}

/* [----------------------------| Dynamically Update Visualizer Text |---------------------------] */

function liveType()
{
	$('#productFormUserName').keypress(function(e){
	    var val=this.value;
	    $('#nameDisplay').val(val);
	});
}

/* [-----------------------| Dynamically Update Visualizer Text with Label |----------------------] */



/* ---------------------------- Populate User Object from list ---------------------------- */

function userInfoToGlobal(titleArg, departmentArg, phoneArg, cellArg, faxArg, pagerArg, binArg, address1Arg, address2Arg, lincArg, busUnitArg, accNumArg, IDArg, rcnArg, ctArg, fercSubArg, activityArg, ewoArg, rrcnArg, projectArg, locationArg) {
    currentUser.userTitle = titleArg;
    currentUser.userAdd1 = address1Arg;
    currentUser.userAdd2 = address2Arg;
    currentUser.userPhone = phoneArg;
    currentUser.userCell = cellArg;
    currentUser.userFax = faxArg;
    currentUser.userPager = pagerArg;
    currentUser.userBusUnit = busUnitArg;
    currentUser.userDept = departmentArg;
    currentUser.userLinc = lincArg;
    currentUser.userBin = binArg;
    currentUser.userAcctNum = accNumArg;
    currentUser.id = IDArg;
    currentUser.userRCN = rcnArg;
    currentUser.userCT = ctArg;
    currentUser.userFERCSUB = fercSubArg;
    currentUser.userActivity = activityArg;
    currentUser.userEWO = ewoArg;
    currentUser.userRRCN = rrcnArg;
    currentUser.userProject = projectArg;
    currentUser.userLocation = locationArg;    
    return currentUser;
}

/* ---------------------------- Create Team Member object, push to Team Member Array (submitterUserList)  ---------------------------- */

function teamMembersToGlobal(titleName, titleEmail, titleArg, departmentArg, phoneArg, cellArg, faxArg, pagerArg, binArg, address1Arg, address2Arg, lincArg, busUnitArg, accNumArg, IDArg, rcnArg, ctArg, fercSubArg, activityArg, ewoArg, rrcnArg, projectArg, locationArg) {
    var profile = {};
    profile.userName = titleName;
    profile.userEmail = titleEmail;
    profile.userTitle = titleArg;
    profile.userAdd1 = address1Arg;
    profile.userAdd2 = address2Arg;
    profile.userPhone = phoneArg;
    profile.userCell = cellArg;
    profile.userFax = faxArg;
    profile.userPager = pagerArg;
    profile.userBusUnit = busUnitArg;
    profile.userDept = departmentArg;
    profile.userLinc = lincArg;
    profile.userBin = binArg;
    profile.userAcctNum = accNumArg;
    profile.id = IDArg;
    profile.userRCN = rcnArg;
    profile.userCT = ctArg;
    profile.userFERCSUB = fercSubArg;
    profile.userActivity = activityArg;
    profile.userEWO = ewoArg;
    profile.userRRCN = rrcnArg;
    profile.userProject = projectArg;
    profile.userLocation = locationArg;


    submitterUserList.push(profile);
    return submitterUserList;
}

/* ----------------------------  DropDown/Select Box Team member (product page and profile page) change function ---------------------------- */

$('#productFormTeamMember, #editProfileFormTeamMember, #editPaymentForm').on('change', function() {
    //console.log('top of function select value = ' + this.value);
    displayedProfileID = $('#hiddenIDDisplay').val();

    //loop through users array, return array number of user displayed
    for (var i = 0; i < userListLength; i++) {
        if (submitterUserList[i].id == this.value) {
            displayedProfileArrayNum = i;
            //console.log('inside loop - arraynum of displayed user = ' + displayedProfileArrayNum);                                                
        }
    }

    //console.log('outside loop - arraynum of displayed user = ' + displayedProfileArrayNum);
    // find enclosing form and clear all inputs
    var frm = $(this).closest('.form');
    frm.find('input').val('');

    if (this.value == 0) {
        console.log('this when name = 0 ' + this.value);
        frm.find('input').val('');

        // if chosen dropdown value is current user, populate form
    } else if (this.value == currentUser.id) {

        //console.log('select box should be =  currentUser.ID' + this.value);                                                        
        $('#productFormUserName, #altCustUserName').val(currentUser.submitterName);
        $('#nameDisplay').html(currentUser.submitterName);
        $('#productFormUserEmail, #altCustUserEmail').val(currentUser.submitterEmail);
        $('#emailDisplay').html(currentUser.submitterEmail);
        $('#productFormUserJobTitle, #altCustUserJobTitle').val(currentUser.userTitle);
        $('#titleDisplay').html(currentUser.userTitle);
        $('#productFormUserJobDept, #altCustUserJobDept').val(currentUser.userDept);
        $('#deptDisplay').html(currentUser.userDept);
        $('#productFormUserPhone, #altCustUserPhone').val(currentUser.userPhone);
        $('#phoneDisplay').html('Tel: ' + currentUser.userPhone);
        $('#productFormUserCell, #altCustUserCell').val(currentUser.userCell);
        $('#cellDisplay').html('Cell: ' + currentUser.userCell);
        $('#productFormUserFax, #altCustUserFax').val(currentUser.userFax);
        $('#faxDisplay').html('Fax: ' + currentUser.userFax);
        $('#productFormUserPager, #altCustUserPager').val(currentUser.userPager);
        $('#pagerDisplay').html('Pager: ' + currentUser.userPager);
        $('#productFormUserBin, #altCustUserBin').val(currentUser.userBin);
        $('#binDisplay').html(currentUser.userBin);
        $('#productFormUserAddress1, #altCustUserAddress1').val(currentUser.userAdd1);
        $('#address1Display').html(currentUser.userAdd1);
        $('#productFormUserAddress2,#altCustUserAddress2').val(currentUser.userAdd2);
        $('#address2Display').html(currentUser.userAdd2);
        $('#productFormUserLinc, #altCustUserLinc').val(currentUser.userLinc);
        $('#lincDisplay').html(currentUser.userLinc);
        $('#productFormUserAcctNum, #altCustUserAcctNum').val(currentUser.userAcctNum);
        $('#lincDisplay').html(currentUser.userAcctNum);
        $('#productFormBusinessUnit, #altCustUserBusUnit').val(currentUser.userBusUnit);
        $('#hiddenIDDisplay').val(currentUser.id);
        // payment 
        $('#altCustUserRCN, #paymentFormRCN, #productFormRCN').val(currentUser.userRCN);
        $('#altCustUserCT, #paymentFormCT, #productFormCT').val(currentUser.userCT);
        $('#altCustUserFERCSUB, #paymentFormFERCSUB, #productFormFERCSUB').val(currentUser.userFERCSUB);
        $('#altCustUserActivity, #paymentFormActivity, #productFormActivity').val(currentUser.userActivity);
        $('#altCustUserEWO, #paymentFormEWO, #productFormEWO').val(currentUser.userEWO);
        $('#altCustUserRRCN, #paymentFormRRCN, #productFormRRCN').val(currentUser.userRRCN);
        $('#altCustUserProject, #paymentFormProject, #productFormProject').val(currentUser.userProject);
        $('#altCustUserLocation, #paymentFormLocation, #productFormLocation').val(currentUser.userLocation);        
        //console.log('alternate User ID = ' + currentUser.id);

        // if chosen dropdown value is any number except currentUser.id and '0'                             
    } else {

        //console.log('select box should be = arrayMember.ID = ' + this.value +' = '+ displayedProfileArrayNum);
        $('#productFormUserName, #altCustUserName').val(submitterUserList[displayedProfileArrayNum].userName);
        $('#nameDisplay').html(currentUser.submitterName);
        $('#productFormUserEmail, #altCustUserEmail').val(submitterUserList[displayedProfileArrayNum].userEmail);
        $('#emailDisplay').html(currentUser.userEmail);
        $('#productFormUserJobTitle, #altCustUserJobTitle').val(submitterUserList[displayedProfileArrayNum].userTitle);
        $('#titleDisplay').html(currentUser.userTitle);
        $('#productFormUserJobDept, #altCustUserJobDept').val(submitterUserList[displayedProfileArrayNum].userDept);
        $('#deptDisplay').html(currentUser.userDept);
        $('#productFormUserPhone, #altCustUserPhone').val(submitterUserList[displayedProfileArrayNum].userPhone);
        $('#phoneDisplay').html('Tel: ' + currentUser.userPhone);
        $('#productFormUserCell, #altCustUserCell').val(submitterUserList[displayedProfileArrayNum].userCell);
        $('#cellDisplay').html('Cell: ' + currentUser.userCell);
        $('#productFormUserFax, #altCustUserFax').val(submitterUserList[displayedProfileArrayNum].userFax);
        $('#faxDisplay').html('Fax: ' + currentUser.userFax);
        $('#productFormUserPager, #altCustUserPager').val(submitterUserList[displayedProfileArrayNum].userPager);
        $('#pagerDisplay').html('Pager: ' + currentUser.userPager);
        $('#productFormUserBin, #altCustUserBin').val(submitterUserList[displayedProfileArrayNum].userBin);
        $('#binDisplay').html(currentUser.userBin);
        $('#productFormUserAddress1, #altCustUserAddress1').val(submitterUserList[displayedProfileArrayNum].userAdd1);
        $('#address1Display').html(currentUser.userAdd1);
        $('#productFormUserAddress2,#altCustUserAddress2').val(submitterUserList[displayedProfileArrayNum].userAdd2);
        $('#address2Display').html(currentUser.userAdd2);
        $('#productFormUserLinc, #altCustUserLinc').val(submitterUserList[displayedProfileArrayNum].userLinc);
        $('#lincDisplay').html(currentUser.userLinc);
        $('#productFormUserAcctNum, #altCustUserAcctNum').val(submitterUserList[displayedProfileArrayNum].userAcctNum);
        $('#lincDisplay').html(currentUser.userAcctNum);
        $('#productFormBusinessUnit, #altCustUserBusUnit').val(submitterUserList[displayedProfileArrayNum].userBusUnit);
        $('#businessUnitDisplay').val(submitterUserList[displayedProfileArrayNum].userBusUnit);
        //payment options     
        $('#hiddenIDDisplay').val(submitterUserList[displayedProfileArrayNum].id);
        $('#altCustUserRCN, #paymentFormRCN, #productFormRCN').val(submitterUserList[displayedProfileArrayNum].userRCN);
        $('#altCustUserCT, #paymentFormCT, #productFormCT').val(submitterUserList[displayedProfileArrayNum].userCT);
        $('#altCustUserFERCSUB, #paymentFormFERCSUB, #productFormFERCSUB').val(submitterUserList[displayedProfileArrayNum].userFERCSUB);
        $('#altCustUserActivity, #paymentFormActivity, #productFormActivity').val(submitterUserList[displayedProfileArrayNum].userActivity);
        $('#altCustUserEWO, #paymentFormEWO, #productFormEWO').val(submitterUserList[displayedProfileArrayNum].userEWO);
        $('#altCustUserRRCN, #paymentFormRRCN, #productFormRRCN').val(submitterUserList[displayedProfileArrayNum].userRRCN);
        $('#altCustUserProject, #paymentFormProject, #productFormProject').val(submitterUserList[displayedProfileArrayNum].userProject);
        $('#altCustUserLocation, #paymentFormLocation, #productFormLocation').val(submitterUserList[displayedProfileArrayNum].userLocation);
        //console.log('alternate User ID = ' + currentUser.id);
        displayedProfileID = submitterUserList[displayedProfileArrayNum].id
            // clear form inputs
            //var frm = $('#product-customize');
            //clearProfileUser(frm);
    }
});


/* ---------------------------- Populate User ID Flyout and Contact Us Form ---------------------------- */

function userIDflyoutMenu() {
    $(".flyoutUserID.bubbler").append("<span class='glyphicon glyphicon-user'></span><div class='flyoutUserName'>" + currentUser.submitterName + "</div><div class='flyoutUserEmail'>" + currentUser.submitterEmail + "</div><a href='/sites/E-Print/Pages/user-profile.aspx' class='btn btn-danger'>Edit Profile</a><a href='/sites/E-Print/Pages/Account-Summary.aspx' class='btn btn-default'>Order History</a>");
    $('#flyoutUserIDControl').on('click', function() {
        $('.flyoutUserID').toggle();
    });
}

function flyoutMenuContactUs() {
    $('#slick-6').dcSlick({
        location: 'bottom',
        align: 'right',
        offset: '200px',
        speed: 'fast',
        tabText: 'Slick 6',
        autoClose: true
    });
}

function contactUsFormAutoFill() {
    $("#contactUsName, #nameDisplay").val(currentUser.submitterName);
    $('#contactUsEmail, #emailDisplay').val(currentUser.submitterEmail);
    $("#contactUsPhone, #phoneDisplay").val(currentUser.userPhone);
}

function editProfileFormAutoFill() {
    $("#profileFormUserName").val(currentUser.submitterName);
    $('#profileFormUserEmail').val(currentUser.submitterEmail);
}

/* ---------------------------- Contact Us Form Submittal  ---------------------------- */

function SubmitAQuestion() {
    var User = $("#ManualAuthor").val();
    var Question = $('#contactUsQuestion').val();
    var Email = $('#contactUsEmail').val();
    var Phone = $('#contactUsPhone').val();

    body = "{ '__metadata': { 'type': 'SP.Data.Contact_x0020_UsListItem' },'Title': 'Question', 'Question': '" + Question + "', 'Name': '" + User + "', 'Email': '" + Email + "', 'Phone': '" + Phone + "'  }";

    // Send the request and return the promise.
    // This call does not return response content from the server.
    return jQuery.ajax({
        url: "../_api/lists/getbytitle('Contact Us')/items?$top=1000",
        type: "POST",
        success: onSuccess,
        error: onError,
        data: body,
        headers: {
            "X-RequestDigest": digest,
            "content-type": "application/json;odata=verbose"
        }
    });

    function onSuccess(data, request) {
        thankYouContactUs();
        contactUsFormAutoFill();
    }

    function onError(error) {
        console.log('Error = ' + error);
    }

    function thankYouContactUs() {
        alert("Thank you for your submission. Someone from ePrint Communication will contact you shortly with answers.");
        // Reset form after submission. 
        var frm = $('.dcjct-form');
        frm.find('input').val('');
        frm.find('textarea').val('');
    }
}

/* ----------------------------  Shopping Cart Submission - Grab Product Data from Product List ---------------------------- */

function findProductFromURL(){

	// Is order an update 
	if(displayedCartID){
		/// displayedCartID is not holding the value shoppingCart[displayedCartArrayNum].productId
		shoppingCartSubmission(shoppingCart[displayedCartArrayNum].productType, shoppingCart[displayedCartArrayNum].imageURL, shoppingCart[displayedCartArrayNum].itemPrice);

	//Is order a new submission 
	}else{
		var productTitle;
		var productImageURL;
		var productPrice;
		$.ajax({
			url: "../_api/lists/getbytitle('Products')/items",
			type: "GET",
			headers: {
				"accept": "application/json;odata=verbose",
			},
			success: function(data) {
				$.each(data.d.results, function(index, item) {           
					var PT = item.Title;
					var PI = item.Image;
					var PP = item.Price_x0020_Per_x0020_Item;

					var ID = item.ID;
																
					if(productIdFromURL == ID ){
						productTitle = PT ;
						productImageURL = PI ;
						productPrice = PP ;
						productId = ID;                  					                	
					}
				});
				shoppingCartSubmission(productTitle, productImageURL, productPrice, productId);   
			},
			error: function(error) {
				console.log('Error at findProductFromURL()');
			}			
		});
	//return productContent;
	} 
}

/* ---------------------------- Shopping Cart Submission - Grab printable info from form ---------------------------- */

function shoppingCartSubmission( title, imgURL, price, productId){
	// array num of item save in sessionStorage.getItem('displayedCartArrayNum');

	productContent.printNameIsChecked = $("#nameDisplayToggle").prop('checked');
	productContent.printName = $("#productFormUserName").val();
	productContent.printTitleIsChecked = $("#titleDisplayToggle").prop('checked');
	productContent.printTitle = $("#productFormUserJobTitle").val();
	productContent.printDeptIsChecked = $("#deptDisplayToggle").prop('checked');
	productContent.printDept = $("#productFormUserJobDept").val();
	productContent.printEmailIsChecked = $("#emailDisplayToggle").prop('checked');
	productContent.printEmail = $("#productFormUserEmail").val();
	productContent.printPhoneIsChecked = $("#phoneDisplayToggle").prop('checked');
	productContent.printPhone = $("#productFormUserPhone").val();
	productContent.printCellIsChecked = $("#cellDisplayToggle").prop('checked');
	productContent.printCell = $("#productFormUserCell").val();
	productContent.printFaxIsChecked = $("#faxDisplayToggle").prop('checked');
	productContent.printFax = $("#productFormUserFax").val();	
	productContent.printPagerIsChecked = $("#pagerDisplayToggle").prop('checked');
	productContent.printPager = $("#productFormUserPager").val();
	productContent.printBinIsChecked = $("#binDisplayToggle").prop('checked');
	productContent.printBin = $("#productFormUserBin").val();
	
	productContent.printAdd1IsChecked = $("#address1DisplayToggle").prop('checked');
	productContent.printAdd1 = $("#productFormUserAddress1").val();
	productContent.printAdd2 = $("#productFormUserAddress2").val();

	productContent.printLincIsChecked = $("#lincDisplayToggle").prop('checked');
	productContent.printLinc = $("#productFormUserLinc").val();
	
	productContent.printBusinessUnitIsChecked = $("#businessUnitDisplayToggle").prop('checked');
	productContent.printBusinessUnit = $("#productFormBusinessUnit").val();
	productContent.cartQuanity = $('#productFormCartQuanity').val();
	productContent.cartDelivery = $('#productFormCartDelivery').val();
	productContent.Id = productId;
	productTitle = title;
	productImageURL = imgURL;
	productPrice = price;

    productContent.RCN = $('#productFormRCN').val();
    productContent.CT = $('#productFormCT').val();
    productContent.FERCSUB = $('#productFormFERCSUB').val();
    productContent.Activity = $('#productFormActivity').val();
    productContent.EWO = $('#productFormEWO').val();
    productContent.RRCN = $('#productFormRRCN').val();
    productContent.Project = $('#productFormProject').val();
    productContent.Location = $('#productFormLocation').val();

	//var productID = productIdFromURL;
	var productViewURL = 'https://soco365.sharepoint.com/sites/E-Print/Pages/product.aspx?ID=' +productContent.Id;
	
	//possible delete sm no longer being used 3/15/2017
	// Create URL for product view - Loop through above obj  //
	// function createViewProductURL(productObj){
	// 	for(key in productObj){
	// 	// test for false - if checkbox unchecked change the corresponding input value to empty string
	// 		if(productObj[key] === false){
	// 			var searchForI = key.search("I");
	// 			var cutted = key.substring(0, searchForI);
	// 			productObj[cutted] = ' '; 
				
	// 			// handles the single checkbox for mulitiple address input
	// 			if(key == 'printAdd1IsChecked'){
	// 				var searchForI = key.search("1");
	// 				var cutted2 = key.substring(0, searchForI);							
	// 				cutted2 += '2';
	// 				productObj[cutted2] = ' ';
	// 			}
	// 		}else{
	// 		}
	// 		productViewURL+= "&"+ key + "=" + productObj[key];		
	// 	}			
	// 	return productViewURL;		
	// }
	//createViewProductURL(productContent);

	//  body = "{ '__metadata': { 'type': 'SP.Data.Shopping_x0020_CartListItem' },'Title': '"+productTitle+"', 'productId': '" +productContent.Id + "', 'price': '" +productPrice+ "', 'client': '" +productContent.user+ "', 'quantity': '"+productContent.cartQuanity+"', 'printName': '" +productContent.printName+ "', 'printTitle': '" +productContent.printTitle+ "', 'printDept': '" +productContent.printDept+ "', 'printEmail': '" +productContent.printEmail+ "', 'printPhone': '" +productContent.printPhone+ "', 'printCell': '" +productContent.printCell+ "',  'printFax': '" +productContent.printFax+ "', 'printPager': '" +productContent.printPager+ "', 'printAdd1': '" +productContent.printAdd1+ "', 'printAdd2': '" +productContent.printAdd2+ "', 'printBin' : '" +productContent.printBin+ "', 'printLinc': '" +productContent.printLinc+ "', 'turnaround' : '"+productContent.cartDelivery+"', 'image' : '" +productImageURL+ "', 'printBU': '" +productContent.printBusinessUnit+ "' }";
          

	 body = "{ '__metadata': { 'type': 'SP.Data.Shopping_x0020_CartListItem' },'Title': '"+productTitle+"', 'productId': '" +productContent.Id + "', 'price': '" +productPrice+ "', 'client': '" +currentUser.submitterName+ "', 'clientEmail': '" +currentUser.submitterEmail+ "', 'quantity': '"+productContent.cartQuanity+"', 'printName': '" +productContent.printName+ "', 'printTitle': '" +productContent.printTitle+ "', 'printDept': '" +productContent.printDept+ "', 'printEmail': '" +productContent.printEmail+ "', 'printPhone': '" +productContent.printPhone+ "', 'printCell': '" +productContent.printCell+ "',  'printFax': '" +productContent.printFax+ "', 'printPager': '" +productContent.printPager+ "', 'printAdd1': '" +productContent.printAdd1+ "', 'printAdd2': '" +productContent.printAdd2+ "', 'printBin' : '" +productContent.printBin+ "', 'printLinc': '" +productContent.printLinc+ "', 'turnaround' : '"+productContent.cartDelivery+"', 'image' : '" +productImageURL+ "', 'printBU': '" +productContent.printBusinessUnit+ "', 'RCN': '" + productContent.RCN + "', 'CT': '" + productContent.CT + "', 'FercSub': '" + productContent.FERCSUB + "', 'Activity': '" + productContent.Activity + "', 'EWO': '" + productContent.EWO + "', 'RRCN': '" + productContent.RRCN + "', 'Project': '" + productContent.Project + "', 'Location': '" + productContent.Location + "' }";

	 //if submission is an update
	 if(displayedCartArrayNum){
		 console.log('shoppingCart[displayedCartArrayNum].orderID+ = ' + shoppingCart[displayedCartArrayNum].orderID);
		$.ajax({
			url: "../_api/web/lists/getbytitle('shopping cart')/items(" +shoppingCart[displayedCartArrayNum].orderID+ ")",
			type: "POST",
			success: onSuccess,
			error: onError,			
			data: body,				
			headers: {
				"X-RequestDigest": digest,
				"content-type": "application/json;odata=verbose",
				"IF-MATCH": "*",
				"X-HTTP-Method": "MERGE"
			}
		});
		function onSuccess(data, request) {	
			alert('Updated Order# '+ shoppingCart[displayedCartArrayNum].orderID);
			sessionStorage.setItem('displayedCartArrayNum', '');
			window.location = "https://soco365.sharepoint.com/sites/E-Print/Pages/Catalog.aspx";
			
		}
		function onError(error) {
			console.log('Error updating user info within submitAUser() = ' + error);
		}	
	}else{
		$.ajax({
			url: "https://soco365.sharepoint.com/sites/E-Print/_api/lists/getbytitle('Shopping Cart')/items?$top=1000",
			type: "POST",
            success: onSuccess,
            error: onError,
            data: body,
            headers: {
                "X-RequestDigest": digest,
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*"
            }
		});
		function onSuccess(data, request) {
			window.location = "https://soco365.sharepoint.com/sites/E-Print/Pages/Catalog.aspx";
			displayedCartID = 0;
			displayedCartArrayNum = 0; 		
		}
		function onError(error) {
				console.log("shoppingCartSubmission() Failed " + error);
		}
	}		
}

/* ----------------------------  Display Shopping Cart Items on  ShoppingCart.aspx---------------------------- */  

function shoppingCartShow() {
	var due = '';
	//var t0 = performance.now(); // measuring speed
	$.ajax({		
		url: "../_api/lists/getbytitle('Shopping Cart')/items",
		type: "GET",
		headers: {
			"accept": "application/json;odata=verbose",
		},
		success: function(data) {
			$.each(data.d.results, function(index, item) {
				var URL;
				// if list return matches user / submitter / client						
				if(currentUser.submitterName == item.client){	
					var scD = {};
					scD.user = item.client;
					// scD.cartStatus = item.Status;
					scD.imageURL = item.image;
					scD.productType = item.Title;
					scD.orderID = item.ID;
					// scD.itemNo = item.Item_x0020_Number;
					scD.printName = item.printName;
					scD.printEmail = item.printEmail;
					scD.printOffice = item.printPhone;
					scD.printAddress1 = item.printAdd1;
					scD.printAddress2 = item.printAdd2;
					scD.itemPrice = item.price;
					scD.cartQuantity = item.quantity;					
					scD.productTurnAround = item.turnaround;
					scD.productTime = item.customDeliveryTime;
					scD.printFax = item.printFax;
					scD.printPager = item.printPager;
					scD.printCell = item.printCell;
					scD.productID = item.productId;	
					
					if (scD.ProductTurnAround == 'Standard')
						console.log("Due: " + scD.productTurnAround);
					else
						console.log("Due: " + scD.productTurnAround + " at " + scD.productTime);
					
					if (scD.itemPrice == 'Special Pricing')
						scD.itemPrice = scD.itemPrice;
//					else
//						scD.itemPrice = '$' + scD.itemPrice;
						
					if (scD.productTurnAround == null)
						scD.productTurnAround = 'Standard';
					if ((scD.productTurnAround == null) || (scD.productTurnAround == 'Standard') || (scD.productTime == null))
						due = scD.productTurnAround;
					else
						due = scD.productTurnAround + ' @ ' + scD.productTime;

					// Add cart items to shoppingCart[] array				
					cartItemsToGlobal(scD.user, scD.imageURL, scD.productType, scD.orderID, scD.printName, scD.printEmail, scD.printOffice, scD.printAddress1, scD.printAddress2, scD.itemPrice, scD.cartQuantity, scD.productTurnAround, scD.printFax, scD.printPager, scD.printCell, scD.productID);
					
					// Create cart-item div for shopping cart page layout
					var orderDiv = '#item-content'+scD.orderID;
					var orderDiv2 = "#prodCol"+scD.orderID;
					var orderDiv3 = "#item"+scD.orderID;
					// Update code here to pull in rush order costs.
					// Assign to 'rush' variable, which is already applied to html code to insert
					var rush = "";
					
                    if(scD.productID == '2112'){ // custom order number = 2112 cause RUSH .. that's why dummy. 
                        $("#shoppingBagItems").append("<div id='item"+scD.orderID+"' class='cart-item clearfix'><div class='col-lg-5 product-col'><img src='../SiteCollectionImages/Georgia%20Power%20Product%20Images/customOrder.jpg'><div class='item-name'>"+scD.productType+"</div><div class='item-content' id='item-content"+scD.orderID+"'><div>"+item.customName+"</div><div>"+item.customOutputSize+"</div><div>"+item.customColor+"</div><div>"+item.customPrintOptions+"</div><div>"+item.customPaperOptions+"</div><div>"+item.customPaperStock+"</div></div></div><div class='col-lg-1 price-col'>$"+scD.itemPrice+"</div><div class='col-lg-1 quanity-col txtCenter'>"+scD.cartQuantity+"</div><div class='col-lg-2 turnaround-col txtCenter'>" + due + "</div><div class='col-lg-1 rush-col txtCenter'>" + rush + "</div><div class='col-lg-2 edit-cart-col' ><button class='btn white' onclick='getDigest(shoppingCartItemRemoval,"+scD.orderID+");return false;'>Remove Item</button></div></div>");
                    }else{
                        // Add Container divs of Cart items to shopping bag page
                        $("#shoppingBagItems").append("<div id='item"+scD.orderID+"' class='cart-item clearfix'><div class='col-lg-5 product-col' id='prodCol"+scD.orderID+"'><img src='"+scD.imageURL+"'><div class='item-name'>"+scD.productType+"</div><div class='item-content' id='item-content"+scD.orderID+"'>");
                        
                        // delete empty keys from the Shopping Cart display then Add content to shopping cart divs 
                        var	modArray = {};
                        ieHackForObjectAssign();
                        modArray = Object.assign({}, scD);
                        var count = 1;
                        for (var key in modArray) {	
                            if(modArray[key] == null ){
                                delete modArray[key];
                            }
                            delete modArray.user;
                            // delete modArray.cartStatus;						
                            delete modArray.imageURL;	
                            delete modArray.productType;		
                            delete modArray.orderID;	
                            delete modArray.itemNo;
                            delete modArray.itemPrice;
                            delete modArray.cartQuantity;
                            delete modArray.productTurnAround;
                            delete modArray.productID; 

                            if (modArray.hasOwnProperty(key) && count < 7) {		
                                $(orderDiv).append("<div>"+modArray[key]+"</div>");		
                                count ++;
                            }
                        }			
                        
                        $(orderDiv2).append("</div>");
                        $(orderDiv3).append("</div><div class='col-lg-1 price-col'>$"+scD.itemPrice+"</div><div class='col-lg-1 quanity-col txtCenter'>"+scD.cartQuantity+"</div><div class='col-lg-2 turnaround-col txtCenter'>"+scD.productTurnAround+"</div><div class='col-lg-1 rush-col txtCenter'>" + rush + "</div><div class='col-lg-2 edit-cart-col' ><button class='btn white' onclick='getDigest(shoppingCartItemRemoval,"+scD.orderID+");return false;'>Remove Item</button><button class='btn drk-gray' onClick='getDigest(genPDF,"+scD.orderID+", "+scD.productID+");return false;'>View</button><button class='btn drk-gray'onClick='getDigest(editOrder,"+scD.orderID+");return false;'>Edit</button></div></div>");
                    } // close else
			
					changeShoppingCartIconCount();
				}							
			});
            getShoppingCartTotal()
			cartLength = shoppingCart.length;
		},
		error: function(error) {
			console.log('shoppingCartShow() ' + error.error);
		}
	});
	//var t1 = performance.now(); // measuring speed
	//console.log('milliseconds to generate: = ' + (t1 - t0).toFixed(4));
	//was ( .4750 .4500 1.14 .4800 .5150, .5900 ) == 36500/6 = 6083
	//is ( .5500 .8000 .5300 .4600 .7350, .5350 ) == 36500/6 = 6016
};

/* ---------------------------- ShoppingCart Total and Subtotal  ---------------------------- */

function getShoppingCartTotal(){
    subTotal = 0;
    var specialPricing = false;
	$("#shoppingCartTotal, #shoppingCartSubTotal ").html('');	// zero out subtotal & total display div
	for(var y = 0 ; y < shoppingCart.length; y++){
		if (shoppingCart[y].itemPrice == "Special Pricing")
		{
			shoppingCart[y].itemPrice = 0;
			specialPricing = true;
		}
        if(shoppingCart[y].productId === "2112"){ //if custom order=
            subTotal += (Number(shoppingCart[y].itemPrice) * Number(shoppingCart[y].cartQuantity));
            
        }else{
            subTotal += (Number(shoppingCart[y].itemPrice) * Number(shoppingCart[y].cartQuantity));
        }
	}

    subTotal = Number(subTotal).toFixed(2);
    if (specialPricing == false)
		$("#shoppingCartTotal, #shoppingCartSubTotal ").append("$" + subTotal );
	else
		$("#shoppingCartTotal, #shoppingCartSubTotal ").append("$" + subTotal + " ++");
	return subTotal;
}

/* ---------------------------- ShoppingCart count - UI bubble on cart icon  ---------------------------- */

function changeShoppingCartIconCount(){
	$("#shoppingCartCount").html('');
    itemsInCart = shoppingCart.length;


	// for(var z = 0; z < shoppingCart.length; z++){
	// 	itemsInCart += Number(shoppingCart[z].cartQuantity);
    //     //itemsInCart += Number(shoppingCart[z].cartQuantity);
	// }
	if(itemsInCart == 0){
		$('#shoppingCartCount').hide();				
	}else{
		$('#shoppingCartCount').html(itemsInCart);
		$('#shoppingCartCount').show();	
	}
}

/* ---------------------------- Create cart item obj, add to shopppingCart Array  ---------------------------- */  

function cartItemsToGlobal(user, imageURL, productType, orderID, printName, printEmail, printOffice, printAddress1, printAddress2, itemPrice, cartQuantity, productTurnAround, printFax, printPager, printCell, productID){
	cartItem.user = user;
	cartItem.imageURL = imageURL;
	cartItem.productType = productType;
	cartItem.orderID = orderID;
	cartItem.printName = printName;
	cartItem.printEmail = printEmail;
	cartItem.printOffice = printOffice;
	cartItem.printAddress1 = printAddress1;
	cartItem.printAddress2 = printAddress2;
	cartItem.itemPrice = itemPrice;
	cartItem.cartQuantity = cartQuantity;
	cartItem.productTurnAround = productTurnAround;
	cartItem.printFax = printFax;
	cartItem.printPager = printPager;
	cartItem.printCell = printCell;
	cartItem.productId = productID;

	shoppingCart.push(cartItem);
	cartItem = {};
}

/* ---------------------------- Edit of Shopping Cart Item  ---------------------------- */

function editOrder(orderNum){	
	displayedCartID = orderNum;	
	//loop through shoppingCart array, return array number of item displayed

	for(var i = 0; i < cartLength; i++){

		if(shoppingCart[i].orderID == displayedCartID ){
			displayedCartArrayNum = i;
			sessionStorage.setItem('displayedCartArrayNum', i);		
		}
	}
	window.location = 'https://soco365.sharepoint.com/sites/E-Print/Pages/product.aspx?ID=' +shoppingCart[displayedCartArrayNum].productId ;
}

/* ----------------------------  Removal of Shopping Cart Item   ---------------------------- */  

function shoppingCartItemRemoval(orderIdToDelete) {	
	$.ajax({	
        url: "../_api/lists/getbytitle('Shopping Cart')/items(" + orderIdToDelete + ")",
        type: "DELETE",		
        headers: {
            'accept': 'application/json;odata=verbose',
            "X-RequestDigest": digest,
            "content-type": "application/json;odata=verbose",
            "X-HTTP-Method": "DELETE",
            "If-Match": "*"
        },    	
		success: function (response)
		{

			// delete item from array
			for(var i = 0; i < cartLength ; i++){
			//	if((shoppingCart[i].orderID == orderIdToDelete ) || (shoppingCart[i].ID == orderIdToDelete)){
				if(shoppingCart[i].ID == orderIdToDelete){
					shoppingCart.splice(i, 1);
					//cartLength += (Number(shoppingCart[i].itemPrice) * Number(shoppingCart[i].cartQuantity));	
				}
			}
			//location.reload();
			changeShoppingCartIconCount(); //update shopping cart bubble 			
			getShoppingCartTotal(); // repopulate subtotal & total display div
			$('#item' + orderIdToDelete).fadeOut(1000, function(){ $(this).remove();
//			alert("Item removed from cart");
			location.reload();});
		},
		error: function(error) {
			alert('shoppingCartItemRemoval() fail');
		}
	});		
}; 

/* ---------------------------- Submit order from Shopping Cart to Orders list ---------------------------- */ 

function completeOrder() {
	
    var notes = $("#specialInstruction").val();
    var shipName = $("#shippingFormName").val();
    var shipAdd1 = $("#shippingFormAdd1").val();
    var shipAdd2 = $("#shippingFormAdd2").val();
    var shipBin = $("#shippingFormBin").val();
    var RCN = $('#billingRCN').val();
    var CT = $('#billingCT').val();
    var Ferc = $('#billingFerc').val();
    var activity = $('#billingActivity').val();
    var EWO = $('#billingEWO').val();
    var RRCN = $('#billingRRCN').val();
    var project = $('#billingProject').val();
    var location = $('#billingLocation').val();

    $.ajax({

        url: "../_api/lists/getbytitle('Shopping%20Cart')/items",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function(data) {
			

            $.each(data.d.results, function(index, item) {

				var id = item.Id;

                if (currentUser.submitterName == item.client) {
					// var body = "{ '__metadata': { 'type': 'SP.Data.OrdersListItem' }, 'Title': '" + item.Title + "', 'productId': '" + item.productId + "', 'price': '" + item.price + "','quantity': '" + item.quantity + "', 'client': '" + item.client + "',  'clientEmail': '" + item.clientEmail + "', 'printName': '" + item.printName + "', 'printTitle': '" + item.printTitle + "', 'printDept': '" + item.printDept + "', 'printEmail': '" + item.printEmail + "', 'printPhone': '" + item.printPhone + "', 'printCell': '" + item.printCell + "', 'printFax': '" + item.printFax + "', 'printPager': '" + item.printPager + "', 'printAdd1': '" + item.printAdd1 + "', 'printAdd2': '" + item.printAdd2 + "', 'printBin': '" + item.printBin + "', 'printBU': '" + item.printBU + "', 'printLinc': '" + item.printLinc + "', 'turnaround': '" + item.turnaround +"', 'notes': '"+ notes +"',  'RCN': '" + item.RCN + "', 'CT': '" + item.CT + "', 'FercSub': '" + item.FercSub + "', 'Activity': '" + item.Activity + "', 'EWO': '" + item.EWO + "', 'RRCN': '" + item.RRCN + "', 'Project': '" + item.Project + "','Location': '" + item.Location + "', 'shipName': '" + shipName + "', 'shipAdd1': '" + shipAdd1 + "', 'shipAdd2': '" + shipAdd2 + "', 'shipBin': '" + shipBin + "'}";

//					var body = "{ '__metadata': { 'type': 'SP.Data.OrdersListItem' }, 'Title': '" + item.Title + "', 'productId': '" + item.productId + "', 'price': '" + item.price + "','quantity': '" + item.quantity + "', 'client': '" + item.client + "',  'clientEmail': '" + item.clientEmail + "', 'printName': '" + item.printName + "', 'printTitle': '" + item.printTitle + "', 'printDept': '" + item.printDept + "', 'printEmail': '" + item.printEmail + "', 'printPhone': '" + item.printPhone + "', 'printCell': '" + item.printCell + "', 'printFax': '" + item.printFax + "', 'printPager': '" + item.printPager + "', 'printAdd1': '" + item.printAdd1 + "', 'printAdd2': '" + item.printAdd2 + "', 'printBin': '" + item.printBin + "', 'printBU': '" + item.printBU + "', 'printLinc': '" + item.printLinc + "', 'turnaround': '" + item.turnaround +"', 'notes': '"+ notes +"',  'RCN': '" + item.RCN + "', 'CT': '" + item.CT + "', 'FercSub': '" + item.FercSub + "', 'Activity': '" + item.Activity + "', 'EWO': '" + item.EWO + "', 'RRCN': '" + item.RRCN + "', 'Project': '" + item.Project + "','Location': '" + item.Location + "', 'shipName': '" + shipName + "', 'shipAdd1': '" + shipAdd1 + "', 'shipAdd2': '" + shipAdd2 + "', 'shipBin': '" + shipBin + "', 'customName': '" + item.customName + "', 'customOutputSize': '" + item.customOutputSize + "', 'customColor': '" + item.customColor + "', 'customPaperOptions': '" + item.customPaperOptions + "', 'customEdgeOptions': '" + item.customEdgeOptions + "', 'customPackaging': '" + item.customPackaging + "', 'customPaperStock': '" + item.customPaperStock + "', 'customPaperType': '" + item.customPaperType + "', 'customPrintOptions': '" + item.customPrintOptions + "', 'customBleed': '" + item.customBleed + "', 'customLaminate': '" + item.customLaminate + "', 'customFold': '" + item.customFold + "', 'customBindingOptions': '" + item.customBindingOptions + "', 'customBindingTabs': '" + item.customBindingTabs + "',  'customBindingNotes': '" + item.customBindingNotes + "', 'customNotes': '" + item.customNotes + "', 'customDeliveryTime': '" + item.customDeliveryTime + "', 'customOrderFileUrl' : '"+ item.customOrderFileUrl +"','customQuantity': '" + item.customQuantity + "' }";
					var body = "{ '__metadata': { 'type': 'SP.Data.OrdersListItem' }, 'Title': '" + item.Title + "', 'productId': '" + item.productId + "', 'price': '" + item.price + "','quantity': '" + item.quantity + "', 'client': '" + item.client + "',  'clientEmail': '" + item.clientEmail + "', 'printName': '" + item.printName + "', 'printTitle': '" + item.printTitle + "', 'printDept': '" + item.printDept + "', 'printEmail': '" + item.printEmail + "', 'printPhone': '" + item.printPhone + "', 'printCell': '" + item.printCell + "', 'printFax': '" + item.printFax + "', 'printPager': '" + item.printPager + "', 'printAdd1': '" + item.printAdd1 + "', 'printAdd2': '" + item.printAdd2 + "', 'printBin': '" + item.printBin + "', 'printBU': '" + item.printBU + "', 'printLinc': '" + item.printLinc + "', 'turnaround': '" + item.turnaround +"', 'notes': '"+ notes +"',  'RCN': '" + RCN + "', 'CT': '" + CT + "', 'FercSub': '" + Ferc + "', 'Activity': '" + activity + "', 'EWO': '" + EWO + "', 'RRCN': '" + RRCN + "', 'Project': '" + project + "','Location': '" + location + "', 'shipName': '" + shipName + "', 'shipAdd1': '" + shipAdd1 + "', 'shipAdd2': '" + shipAdd2 + "', 'shipBin': '" + shipBin + "', 'customName': '" + item.customName + "', 'customOutputSize': '" + item.customOutputSize + "', 'customColor': '" + item.customColor + "', 'customPaperOptions': '" + item.customPaperOptions + "', 'customEdgeOptions': '" + item.customEdgeOptions + "', 'customPackaging': '" + item.customPackaging + "', 'customPaperStock': '" + item.customPaperStock + "', 'customPaperType': '" + item.customPaperType + "', 'customPrintOptions': '" + item.customPrintOptions + "', 'customBleed': '" + item.customBleed + "', 'customLaminate': '" + item.customLaminate + "', 'customFold': '" + item.customFold + "', 'customBindingOptions': '" + item.customBindingOptions + "', 'customBindingTabs': '" + item.customBindingTabs + "',  'customBindingNotes': '" + item.customBindingNotes + "', 'customNotes': '" + item.customNotes + "', 'customDeliveryTime': '" + item.customDeliveryTime + "', 'customOrderFileUrl' : '"+ item.customOrderFileUrl +"','customQuantity': '" + item.customQuantity + "' }";



                    return jQuery.ajax({
                        url: "../_api/lists/getbytitle('Orders')/items",
                        type: "POST",
                        success: onSuccess,
                        error: onError,
                        data: body,
                        headers: {
                            "X-RequestDigest": digest,
                            "content-type": "application/json;odata=verbose",
                            "IF-MATCH": "*"
                        }
                    });

                    function onSuccess(data, request) {

                        shoppingCartItemRemoval( item.Id);
						window.location = 'https://soco365.sharepoint.com/sites/E-Print/Pages/thank-you.aspx';
                    }

                    function onError(error) {
						 console.log('error on inside completeOrder() This is the error: ' + error);
					}
                } /* close if */
            }); /* close each */
        }, /* close success */
        error: function(error) {
            console.log('error on outside completeOrder() This is the error: ' + error);
        }
    });/* close ajax */
    
};

/* ---------------------------- Hack for I.E and object assignment  ---------------------------- */  

function ieHackForObjectAssign(){
	if (typeof Object.assign != 'function') {
	Object.assign = function(target) {
		'use strict';
		if (target == null) {
		throw new TypeError('Cannot convert undefined or null to object');
		}

		target = Object(target);
		for (var index = 1; index < arguments.length; index++) {
		var source = arguments[index];
		if (source != null) {
			for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
			}
		}
		}
		return target;
	};
	}	
}

/* ---------------------------- display all orders on admin page ---------------------------- */ 

function getAdminOrders(){
    
    var weekday = new Array(7);
    weekday[0]=  "Mon";
    weekday[1] = "Tue";
    weekday[2] = "Wed";
    weekday[3] = "Thu";
    weekday[4] = "Fri";
    weekday[5] = "Sat";
    weekday[6] = "Sun";
    
	$.ajax({        
		url: "../_api/lists/getbytitle('Orders')/items?$top=1000",
		type: "GET",
		headers: {
		"accept": "application/json;odata=verbose",
		},
		success: function(data) {
			$.each(data.d.results, function(index, item) {
			    // var orderId = item.Id;
			    // var client = item.Name;
			    // var email = item.email;
			    // var quantity = item.quantity;
			    // var opco = item.opco;
			    // var greeting = item.greeting;
			    // var message = item.message;
			    // var envelope = item.envelope;
			    // var format = item.format;
			    // var productId = item.productId;
			    // var status = item.status;
			    // var rcn = item.RCN;
			    // var ct = item.CT;
			    // var activity = item.Activity;
			    // var ewo = item.EWO;
			    // var project = item.project;
			    // var location = item.Location;
			    // var fercSub = item.Ferc_x002d_Sub;
			    // var rrcn = item.RRCN;
			    var orderDate = item.Created;
			    // var bin = item.Bin;
			    // var notes = item.Notes;
			    // var add1 = item.address1;
			    // var add2 = item.address2;
			    //var format = item.format;
			    var date = new Date(orderDate);

                orderDate = weekday[date.getDay()] + ' ' + date.getMonth()  + '/' + date.getDate() + '/' +  date.getFullYear();
                   
				$(".turnAroundStandard").append("<div class='admin-order-item clearfix' id='order" +item.Id+ "'><div class='col-lg-1'>" +item.Id+ "</div><div class='col-lg-2'><div>" +item.client+ "</div><div>" +item.clientEmail+ "</div></div><div class='col-lg-1'>" +orderDate+ "</div><div class='col-lg-1'><div class='bold brown'>" +item.Title + "</div><div>Order of: "+ item.quantity +"</div></div><div class='col-lg-2' ><div>"+item.shipName+"</div><div>"+item.shipAdd1+"</div><div>"+item.shipAdd2+"</div><div>"+item.shipBin+"</div></div><div class='col-lg-2'><div>Location: "+item.Location+"</div><div>RCN:  "+item.RCN+"</div><div>CT: "+item.CT+"</div><div>EWO: "+item.EWO+"</div><div>Activity: "+item.Activity  +"</div><div>FercSub: "+item.FercSub+"</div><div>Project: "+item.Project+"</div></div><div class='col-lg-2'>"+item.notes +"</div><div class='col-lg-1' ><button class='btn red' onClick='getDigest(orderDetail("+item.Id+" ));return false;'>View Order</button><button class='btn brown' onClick='getDigest(genPDFAdmin("+item.Id+", "+item.productId+"));return false;'>View File</button></div>");                                                                              
//<button class='btn red'>Cancel</button></div> removed

			});
		},
		error: function(error) {
			console.log('Error getAdminOrders()');
		}
	});
}
 
/* ----------------------------  Custom Order Page - Calculate Cost ---------------------------- */

function customOrderCost(){
	var specialPricing = false;
	var customOrderPrice = 0;
    var customOrderValues = {};
    
    console.log("customOrderCost()");
    console.log("...... retreiving order cost");
    customOrderValues.color = $("input[type=radio][name=customOrderColor]:checked").val();
    customOrderValues.size = $("#customOrderSize").find(':selected').val();        
    customOrderValues.coated = $("#customOrderPaperCoating").find(':selected').val();
    customOrderValues.paper = $("#customOrderPaperStock").find(':selected').val();
    customOrderValues.bleed = $("#customOrderBleed").find(':selected').val();

	customOrderValues.edge = $("#customOrderEdge").find(':selected').val();
	customOrderValues.packaging = $("#customOrderPackaging").find(':selected').val();
	customOrderValues.laminate = $("#customOrderLaminate").find(':selected').val();
	customOrderValues.fold = $("#customOrderFold").find(':selected').val();
	customOrderValues.binding = $("#customOrderBindingOptions").find(':selected').val();
	customOrderValues.tabs = $("#customOrderBindingTabs").find(':selected').val();
	
    // quanitiy
    // instantiate 'quantity' to value in textfield (if empty, sets value to 0)
    var customQuantity =  $("#customOrderQuanity").val() ;
    if ((customQuantity == null) || (customQuantity == ''))
    	customQuantity = 0;
    var pageCount = '';
    pageCount = $("#customOrderPages").val();
    if ((pageCount == null) || (pageCount == ''))
    	pageCount = 0;
    	
    console.log("quantity: " + customQuantity);
    console.log("pages: " + pageCount);
    // customOrderPriceTotal;
    // Black and White
    console.log('----------'); 

    if(customOrderValues.color == 'Black&White'){
        customOrderPrice += .08;
        console.log('color = Black & White'); 

        // Paper Bleed 
        if(customOrderValues.bleed == 'yes') {
                customOrderPrice += .04;
                console.log('bleed = Yes');
        }        
        
        // Paper Size 8.5 x 11
        if(customOrderValues.size == '8.5x11') {
            console.log('size = 8.5x11');
            if(customOrderValues.paper == 'regular20lb'){
                // customOrderPrice += .01;
                console.log('option = regular20lb');
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .01;
                console.log('option = premium28lb');                
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .03;
                console.log('option = medium80lb');                
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .04;
                console.log('option = heavy100lb');                
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .06;
                console.log('option = lightStock80lb');                
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .08;
                console.log('option = meduimStock100lb');                
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .10;
                console.log('option = heavyStock110lb');                
            }
        // Paper Size 8.5 x 14
        }else if(customOrderValues.size == '8.5x14'){
            console.log('else if -> 8.5x14');
            if(customOrderValues.paper == 'regular20lb'){
                customOrderPrice += .04;
                console.log('option = regular20lb');                  
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .06;
                console.log('option = premium28lb');                  
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .07;
                console.log('option = medium80lb');                  
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .08;
                console.log('option = heavy100lb');                  
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .09;
                console.log('option = lightStock80lb');                  
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .10;
                console.log('option = meduimStock100lb');                  
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .12;
                console.log('option = heavyStock110lb');                  
            }    
        // Paper Size 11 x 17                    
        }else if(customOrderValues.size == '11x17'){
            console.log('else if -> 11x17');
            if(customOrderValues.paper == 'regular20lb'){
                customOrderPrice += .05;
                console.log('option = regular20lb');                  
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .06;
                console.log('option = premium28lb');                  
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .07;
                console.log('option = medium80lb');                  
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .08;
                console.log('option = heavy100lb');                  
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .09;
                console.log('option = lightStock80lb');                  
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .10;
                console.log('option = meduimStock100lb');                  
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .12;
                console.log('option = heavyStock110lb');                  
            }   
        // Paper Size 12 x 18
        }else if(customOrderValues.size == '12x18'){
            console.log('else if -> 12x18');
            if(customOrderValues.paper == 'regular20lb'){
                customOrderPrice += .08;
                console.log('option = regular20lb');                 
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .08;
                console.log('option = premium28lb');                 
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .09;
                console.log('option = medium80lb');                 
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .10;
                console.log('option = heavy100lb');                 
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .11;
                console.log('option = lightStock80lb');                 
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .12;
                console.log('option = meduimStock100lb');                 
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .13;
                console.log('option = heavyStock110lb');                 
            }               
        }    

     // Color Custom Product   
    }else {
        console.log('color = color');         
        customOrderPrice += .40;
        
        // Paper Bleed 
        if(customOrderValues.bleed == 'yes') {
                customOrderPrice += .05;
                console.log('bleed = Yes');
        }        
        
        // Paper Size 8.5 x 11
        if(customOrderValues.size == '8.5x11') {
            console.log('size = 8.5x11');
            if(customOrderValues.paper == 'regular20lb'){
                // customOrderPrice += .01;
                console.log('option = regular20lb');
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .05;
                console.log('option = premium28lb');                
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .09;
                console.log('option = medium80lb');                
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .11;
                console.log('option = heavy100lb');                
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .15;
                console.log('option = lightStock80lb');                
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .18;
                console.log('option = meduimStock100lb');                
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .28;
                console.log('option = heavyStock110lb');                
            }
        // Paper Size 8.5 x 14
        }else if(customOrderValues.size == '8.5x14'){
            console.log('else if -> 8.5x14');
            if(customOrderValues.paper == 'regular20lb'){
                customOrderPrice += .05;
                console.log('option = regular20lb');                  
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .35;
                console.log('option = premium28lb');                  
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .39;
                console.log('option = medium80lb');                  
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .41;
                console.log('option = heavy100lb');                  
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .45;
                console.log('option = lightStock80lb');                  
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .48;
                console.log('option = meduimStock100lb');                  
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .58;
                console.log('option = heavyStock110lb');                  
            }    
        // Paper Size 11 x 17                    
        }else if(customOrderValues.size == '11x17'){
            console.log('else if -> 11x17');
            if(customOrderValues.paper == 'regular20lb'){
                customOrderPrice += .20;
                console.log('option = regular20lb');                  
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .35;
                console.log('option = premium28lb');                  
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .39;
                console.log('option = medium80lb');                  
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .41;
                console.log('option = heavy100lb');                  
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .45;
                console.log('option = lightStock80lb');                  
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .48;
                console.log('option = meduimStock100lb');                  
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .58;
                console.log('option = heavyStock110lb');                  
            }   
        // Paper Size 12 x 18
        }else if(customOrderValues.size == '12x18'){
            console.log('else if -> 12x18');
            if(customOrderValues.paper == 'regular20lb'){
                customOrderPrice += .45;
                console.log('option = regular20lb');                 
            }else if(customOrderValues.paper == 'premium28lb'){
                customOrderPrice += .45;
                console.log('option = premium28lb');                 
            }else if(customOrderValues.paper == 'medium80lb'){
                customOrderPrice += .49;
                console.log('option = medium80lb');                 
            }else if(customOrderValues.paper == 'heavy100lb'){
                customOrderPrice += .51;
                console.log('option = heavy100lb');                 
            }else if(customOrderValues.paper == 'lightStock80lb'){
                customOrderPrice += .55;
                console.log('option = lightStock80lb');                 
            }else if(customOrderValues.paper == 'meduimStock100lb'){
                customOrderPrice += .58;
                console.log('option = meduimStock100lb');                 
            }else if(customOrderValues.paper == 'heavyStock110lb'){
                customOrderPrice += .68;
                console.log('option = heavyStock110lb');                 
            }               
        }    
    }            

    // Paper Options - Coated : Dull?
    if(customOrderValues.coated == 'Coated') {
            customOrderPrice += .05;
            console.log('coated = yes');                 
    }

//     var customOrderValues = [];
//     customOrderValues.push( $("#customOrderSize").find(':selected').data("price") );    
//     customOrderValues.push( $( "input[type=radio][name=customOrderColor]:checked" ).data("price"));
//     customOrderValues.push( $("#customOrderPaperCoating").find(':selected').data("price") );
//     customOrderValues.push( $("#customOrderEdge").find(':selected').data("price") );
//     customOrderValues.push( $("#customOrderPackaging").find(':selected').data("price") );
//     customOrderValues.push( $("#customOrderPaperStock").find(':selected').data("price") );
//     customOrderValues.push( $( "input[type=radio][name=customOrderPrintOptions]:checked" ).data("price") );
//     customOrderValues.push( $("#customOrderBleed").find(':selected').data("price") );
//     customOrderValues.push( $("#customOrderLaminate").find(':selected').data("price") );
//     customOrderValues.push( $("#customOrderFold").find(':selected').data("price") );
//     // binding
//     customOrderValues.push( $( "#customOrderBindingOptions" ).find(':selected').data("price") );
//     customOrderValues.push( $("#customOrderBindingTabs").find(':selected').data("price") );
//     // customOrderValues.push( $("#customOrderFinishing").find(':selected').data("price") );
//     // quanitiy
//     var customQuantity =  $("#customOrderQuanity").val() ;
   
//    // convert array of strings to array of num
//    var sum  = customOrderValues.map(Number);

//     // sum of array in array x quantity
//     //customOrderPrice = (sum.reduce(function(a, b) { return a + b; })) * customQuantity ;

//     // sum of array cost per item
//     customOrderPrice = (sum.reduce(function(a, b) { return a + b; })) ;
//     customOrderPrice = customOrderPrice.toFixed(2);
//     // sum of array in array x quantity

	$('#quantityTotal').text(customQuantity);
	customOrderPrice = customOrderPrice * pageCount;
	
	if ((customOrderValues.edge == "Standard") && (customOrderValues.packaging == "Shrink Wrap") &&
		(customOrderValues.laminate == "No") && (customOrderValues.fold == "No") &&
		(customOrderValues.binding == "None") && (customOrderValues.tabs == "None"))
	{
		specialPricing = false;
		customOrderPriceTotal = customOrderPrice * customQuantity;
		customOrderPriceTotal = customOrderPriceTotal.toFixed(2);
		$('#costPerItem').text('$' + customOrderPrice.toFixed(2)); 
	    $('#costTotal').text('$' + customOrderPriceTotal);
	}
	
	else
	{
		specialPricing = true;
		customOrderPriceTotal = "Special Pricing";
		$('#costPerItem').text(customOrderPriceTotal);
	    $('#costTotal').text(customOrderPriceTotal);
	}

	console.log("Basic Order Information");
	console.log("<------------------------------->");
	console.log("Project Page Length: " + pageCount);
	console.log("Number of Copies: " + customQuantity);
	console.log("Special Order and Binding options");
	console.log("<------------------------------->");
	console.log("Special Order Edge: " + customOrderValues.edge);
	console.log("Special Order Packaging: " + customOrderValues.packaging);
	console.log("Special Order Laminate: " + customOrderValues.laminate);
	console.log("Special Order Fold: " + customOrderValues.fold);
	console.log("Binding Options: " + customOrderValues.binding);
	console.log("Binding Tabs: " + customOrderValues.tabs);
	console.log("Specialized Pricing Applies (T/F): " + specialPricing);
	console.log("Unit Price: " + customOrderPrice);
	console.log("Total Price: " + customOrderPriceTotal);
	console.log("....... order costs retreived");
   /* customOrderPriceTotal = 0;
    customOrderPrice = 0;*/
}

/* ---------------------------- Submit Custom Order to Shopping Cart ---------------------------- */ 

function submitCustomOrder(fileUrl, url) {
    var name = $("#customOrderProductName").val();
    var quantity = $("#customOrderQuanity").val();
    var outputSize = $("select#customOrderSize").val();
    var color =  $( "input[type=radio][name=customOrderColor]:checked" ).val();
    var paperOption = $("#customOrderPaperCoating").val();
    var edge = $("#customOrderEdge").val();
	var packaging = $("#customOrderPackaging").val();
    var price = document.getElementById("costPerItem").innerHTML;
//    console.log("Price-1: " + price);
	if (price != "Special Pricing")
    	price = price.slice(1);
//    console.log("Price-2: " + price);
    var paperStock = $("#customOrderPaperStock").val();	
	var paperType = $("#customOrderPaperType").val();
	var printOptions =  $( "input[type=radio][name=customOrderPrintOptions]:checked" ).val();
    var bleed = $("#customOrderBleed").val();
	var laminate = $("#customOrderLaminate").val();
    var fold = $("#customOrderFold").val();
	var bindingOptions = $( "#customOrderBindingOptions" ).val();
    var bindingTabs =  $("#customOrderBindingTabs").val();
	var bindingInstruction = $("#specialInstructionBinding").val();
	var requestedDelivery = '';
    var instruction = $("#specialInstruction").val();
	var requestedDelivery = $("#datepicker").val();
	var time = $("#customOrderRequestedTime").text();
//	console.log("time: " + time);
	var pad = $("#customOrderRequestedPad").val();   
	var body = '';
	
	
	console.log("submitCustomOrder()");
	console.log("...... submitting order");
	// instantiate 'requestDelivery' to datepicker value if present, or defaults to 'Standard' if blank
	// console.log("Pre-Requested Delivery = " + requestedDelivery);
	requestedDelivery = $("#datepicker").val();
	if ((requestedDelivery == null) || (requestedDelivery == ''))
	{
		requestedDelivery = 'Standard';
		time = '';
	}
	// console.log("Post-Requested Delivery = " + requestedDelivery);

	console.log("Pre-try...");
	try
	{
		console.log("Inside Try...");
		body = "{ '__metadata': { 'type': 'SP.Data.Shopping_x0020_CartListItem' }, 'Title': 'Custom Order', 'productId': '2112', 'price': '"+ price +"', 'quantity': '"+ quantity +"', 'client': '" + currentUser.submitterName + "', 'clientEmail': '" + currentUser.submitterEmail + "', 'printAdd1': '" + currentUser.userAdd1 + "', 'printAdd2': '" + currentUser.userAdd2 + "', 'printBin': '" + currentUser.userBin + "', 'printBU': '" + currentUser.userBusUnit + "', 'printLinc': '" + currentUser.userLinc + "', 'RCN': '" + currentUser.userRCN + "', 'CT': '" + currentUser.userCT + "', 'FercSub': '" + currentUser.userFERCSUB + "', 'Activity': '" + currentUser.userActivity + "', 'EWO': '" + currentUser.userEWO + "', 'RRCN': '" + currentUser.userRRCN + "', 'Project': '" + currentUser.userProject + "', 'Location': '" + currentUser.userLocation + "', 'customName': '" + name + "', 'customOutputSize': '" + outputSize + "', 'customColor': '" + color + "', 'customPaperOptions': '" + paperOption + "', 'customEdgeOptions': '" + edge + "', 'customPackaging': '" + packaging + "', 'customPaperStock': '" + paperStock + "', 'customPaperType': '" + paperType + "', 'customPrintOptions': '" + printOptions + "', 'customBleed': '" + bleed + "', 'customLaminate': '" + laminate + "', 'customFold': '" + fold + "', 'customBindingOptions': '" + bindingOptions + "', 'customBindingTabs': '" + bindingTabs + "', 'customBindingNotes': '" + bindingInstruction + "', 'customNotes': '" + instruction + "', 'turnaround': '" + requestedDelivery + "', 'customDeliveryTime': '" + time + "', 'customOrderFileUrl' : '"+ fileUrl +"'  }";	
	    $.ajax({
	        url: "../_api/lists/getbytitle('Shopping%20Cart')/items",
			type: "POST", 
			data: body,
			headers:{
						"X-RequestDigest": digest,
						"content-type": "application/json;odata=verbose",
		                "If-Match": "*"
					},
	        success: function(data) {
	//			window.location = 'https://soco365.sharepoint.com/sites/E-Print/Pages/Catalog.aspx';
				console.log("Item added to cart successfully.");
				//navigate();
	
			},
	        error: function(err) {
	            console.log('error on outside submitCustomOrder() This is the error: ' + err);
	        }
	    });
	}
	
	catch(error)
	{
		console.log("Error logged: " + error);
		alert("Found an error, no element added to list.\n" + error);
	}
	
	console.log(".... order submitted");
    navCallBack(url, function(){location.reload();});

};

// ----------------------- FILE UPLOAD FUNCTIONS ----------------------- //

// Upload the file.
// You can upload files up to 2 GB with the REST API.
function uploadFile(url)
{
	console.log("uploadFile()");
	console.log("calling for order cost....");
    customOrderCost();

    // Define the folder path for this example.
    var serverRelativeUrlToFolder = 'Custom Order Files';

    // Get test values from the file input and text input page controls.
    var fileInput = $('#getFile');
    // sloppy form validation
    var name = $("#customOrderProductName").val();
    var quantity = $("#customOrderQuanity").val();
    var pages = $("#customOrderPages").val();
    if( !name ){
        $('#formError').show().text('Project Name is Required');
        $('#customOrderProductName').addClass('error');
        return;        
    }   
    $('#customOrderProductName').removeClass('error');
    if(!quantity){
        $('#formError').show().text('Quantity is Required');
        $('#customOrderQuanity').addClass('error');
        return;      
    }
    if (!(quantity > 0))
    {
        $('#formError').show().text('Quantity must be greater than 0.');
        $('#customOrderQuanity').addClass('error');
        return;      
    }
    if (quantity % 1 != 0)
    {
        $('#formError').show().text('Quantity must be a whole number.');
        $('#customOrderQuanity').addClass('error');
        return;      
    }

    $('#customOrderQuanity').removeClass('error');
    if (!pages)
    {
    	$("#formError").show().text("Number of Pages is required");
    	$("#customOrderPages").addClass("error");
    	return;
    }
    if (isNaN(pages))
    {
    	$("#formError").show().text("Number of Pages must be numberical.");
    	$("#customOrderPages").addClass("error");
    	return;
    }

    if (pages < 1)
    {
    	$("#formError").show().text("Number of Pages must be greater than 0.");
    	$("#customOrderPages").addClass("error");
    	return;
    }
    if (pages % 1 != 0)
    {
        $('#formError').show().text('Number of Pages must be a whole number.');
        $('#customOrderPages').addClass('error');
        return;      
    }
    $("#customOrderPagaes").removeClass('error');
    // end sloppy form validation


    if( fileInput[0].files[0] )
    {
        $('#getFile').removeClass('error');
	    var fileType = fileInput[0].files[0].name;
	    fileType = fileType.split('.').pop().toLowerCase();
	    // console.log( fileType);
	    // console.log( typeof fileType);
	    // return;
	    var newName = $.now();
	
	    // Get the server URL.
	    var serverUrl = _spPageContextInfo.webAbsoluteUrl;
	 
	
	    // Initiate method calls using jQuery promises.
	    // Get the local file as an array buffer.
	    console.log("calling getFileBuffer()");
	    var getFile = getFileBuffer();
	    getFile.done(function (arrayBuffer) {
	
	        // Add the file to the SharePoint folder.
	        console.log("calling addFileToFolder()");
	//        var addFile = setTimeout(addFileToFolder(arrayBuffer), 1000);
			var addFile = addFileToFolder(arrayBuffer);
	        console.log("addFile return = " + JSON.stringify(addFile));
	        addFile.done(function (file, status, xhr) {
	            // Get the list item that corresponds to the uploaded file.
	            console.log("calling getListItem()");
	//            var getItem = setTimeout(getListItem(file.d.ListItemAllFields.__deferred.uri), 2000);
				var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
	            console.log("getItem return = " + JSON.stringify(getItem));
	            getItem.done(function (listItem, status, xhr) {
	                
	                // Change the display name and title of the list item.
	                console.log("calling updateListItem()");
	                var changeItem = updateListItem(listItem.d.__metadata); 
	                changeItem.done(function (data, status, xhr) {
	                    // alert('file uploaded and updated');
	                    var fileUrl = 'https://soco365.sharepoint.com/sites/E-Print/Custom%20Order%20Files/' + newName + '.'+ fileType;
	
						console.log("calling submitCustomOrder");
	                    submitCustomOrder(fileUrl, url);
	                });
	                changeItem.fail(onError);
	            });
	            getItem.fail(onError);
	           
	        });
	        addFile.fail(onError);
	    });
	    getFile.fail(onError);

//        return;
    }
    
    else
    {
    	fileUrl = "https://soco365.sharepoint.com/sites/E-Print/Shared%20Documents/NoAttachment.txt";
    	submitCustomOrder(fileUrl, url);
    }
    
    $('#getFile').removeClass('error');


    // Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(fileInput[0].files[0]);
        return deferred.promise();
    }

    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

        // Get the file name from the file input control on the page.
        var parts = fileInput[0].value.split('\\');
        var fileName = parts[parts.length - 1];

        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl, serverRelativeUrlToFolder, fileName);

        // Send the request and return the response.
        // This call returns the SharePoint file.
        console.log("addFileToFolder() \n      calling ajax");
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            success: function(){console.log("completed ajax call.");},
            error: function(xhr, status, error){
            	console.log("addFileToFolder() = FAIL \n	error: " + JSON.stringify(xhr.readyState));
            	addFileToFolder(arrayBuffer);
            	},
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": digest,
				"IF-MATCH": "*"
            },
            async: false
        });
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            success: function(){console.log("getlistItem() to " + fileListItemUri);},
            error: function(xhr, status, error){
            	console.log("getListItem() ERROR: " + JSON.stringify(status));
            	getListItem(fileListItemUri);
            	},
            headers: { "accept": "application/json;odata=verbose" },
            async: false
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}",
            itemMetadata.type, newName, newName);

		console.log("	updateListItem()");
        // Send the request and return the promise.
        // This call does not return response content from the server.
        return $.ajax({
            url: itemMetadata.uri,
            type: "POST",
//            success: function(){console.log("updateListItem() URL: " + itemMetadata.uri);return JSON.stringify(xhr.readyState);},
			success: function(){console.log("updateListItem() URL: " + itemMetadata.uri);},
            error: function(xhr, status, error){
            	console.log("updateListItem() ERROR: readyState = " + JSON.stringify(xhr.readyState));
//            	return JSON.stringify(xhr.readyState);
            	},
            data: body,
            headers: {
                "X-RequestDigest": digest,
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE"
            },
            async: false
        });
    }
}

// Display error messages. 
function onError(error) {
    alert("ERROR: (->" + JSON.stringify(error.readyState) + "<-)");
}

/* ---------------------------- General Calls ---------------------------- */ 

$(document).ready(function() {$(window).load(function(){
	var userOpCo;
	var myUser;
	var url = "https://soco365.sharepoint.com/sites/E-Print/_api/lists/getbytitle('User" + " " + "Profiles')/items?$select=UserOpco&$filter=UserName eq ";
    var app = angular.module('formFunctAng', []);
    app.controller('formInputAng', function($scope) {
    // $scope.name = currentUser.submitterName;
    // $scope.title = currentUser.submitterEmail;

    });
    
	GetCurrentUser();

	$("#bs-example-navbar-collapse-1").attr("href", "https://soco365.sharepoint.com/sites/E-Print/Pages/ePrintRedirect.aspx");
	$("#formsLinks").attr("href", "https://soco365.sharepoint.com/sites/E-Print/Pages/ePrintRedirect.aspx");
	$(".redirect").attr("href", "https://soco365.sharepoint.com/sites/E-Print/Pages/ePrintRedirect.aspx");
	$(".popularItems").attr("href", "https://soco365.sharepoint.com/sites/E-Print/Pages/ePrintRedirect.aspx");
	
	setTimeout(function(){
    		console.log("User: " + currentUser.submitterName);
    		myUser = "'" + currentUser.submitterName + "'";
    		url = url + myUser;
    		console.log("rest url: " + url);}, 500);
    	
		setTimeout(function()
		{	
	    	$.ajax({
				url: url,
		        contentType: "application/json;odata=verbose",
		        headers: {"accept": "application/json;odata=verbose"},
		        async: false,
		        success: function(data, request) {
		            currentUser.OpCo = data.d.results[0].UserOpco;
		            isAdmin(currentUser.submitterName);
		            contactUsFormAutoFill();
     				setTimeout(opCoLogo(currentUser), 700);
		            return currentUser;
	        	},
	        	error: function(error) {}
	    	});
	    }, 600);
	   
	
    flyoutMenuContactUs();
    userFormPopulator();
    shoppingCartShow();    
    // areYouNew();
    // navigationTopLevel();
    // navigationSubLevels(); hard coded navigation to lighten load time
 
 	$("#contactUsQuestion").focus(function(){
 		if($("#contactUsQuestion").val() == "Questions/Comments")
 		{
 			$(this).val("");
 		}
 	});
 	
 	$("#contactUsQuestion").mouseleave(function(){
 		$("#contactUsQuestion").val() = $("#contactUsQuestion").val($("#contactUsQuestion").val().trim());
	});
	
 	$("#contactUsQuestion").keyup(function(){
 		if ($("#contactUsQuestion").val().split(' ').join('').length > 0)
 			$("#sendBtn").prop("disabled", false);
 		else
 			$("#sendBtn").prop("disabled", true);
 	});
 	
 	$("#sendBtn").hover(function(){
 		$("#contactUsQuestion").val() = $("#contactUsQuestion").val($("#contactUsQuestion").val().trim());
 	});
 	
 	$("#sendBtn").focus(function(){
 		$("#contactUsQuestion").val() = $("#contactUsQuestion").val($("#contactUsQuestion").val().trim());
 	});
 	
 	if (windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/Home.aspx') {
//    	set delay to allow the code time to get the user from ajax call below
        ePrintRotator();

    
    // Shopping Cart page  
    }
    else if (windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/ShoppingCart.aspx') {
		
		var cartCount = -1;
		
		$(window).load(function(){
			var i = 0;
			var price = "";
			
			console.log("Inside ShoppingCart.aspx window.load function");
			$('.price-col').each(function(index){
				price = $('.price-col')[i].innerHTML;
				
				console.log("Item " + i + " costs: " + price);
				if ($('.price-col')[i].innerHTML == '$Special Pricing')
				{
					$('.price-col')[i].innerHTML = 'Special Pricing';
					console.log("Eliminated a Dollar Sign.");
				}
				i++;
			});
		});
			
		while (cartCount == -1)
		{
			console.log("initial cartCount: " + cartCount);
			cartCount = $('#shoppingCartCount')[0].textContent;
			console.log("count: " + cartCount);
		}
		console.log("Total Items: " + cartCount);
		
//		if (!(cartTot > 0))
//		{
//			$("#checkoutBtn").prop("disabled", true);
//			$("#checkoutButton").prop("disabled", true);
//		}
			
    // Product pages checks against url without ID   
    }else if (url == 'https://soco365.sharepoint.com/sites/E-Print/Pages/product.aspx') {
        productPageDisplay();
//        isAdmin(currentUser.submitterName);
        

        /* ----------- Show / Hide Form Elements on Product Overlay ----------- */
        $("#nameDisplayToggle").change(function() {
            $('#nameDisplay').toggle();
        })
        $("#titleDisplayToggle").change(function() {
            $('#titleDisplay').toggle();
        })
        $("#deptDisplayToggle").change(function() {
            $('#deptDisplay').toggle();
        })
        $("#emailDisplayToggle").change(function() {
            $('#emailDisplay').toggle();
        })
        $("#phoneDisplayToggle").change(function() {
            $('#phoneDisplay').toggle();
        })
        $("#cellDisplayToggle").change(function() {
            $('#cellDisplay').toggle();
        })
        $("#faxDisplayToggle").change(function() {
            $('#faxDisplay').toggle();
        })
        $("#pagerDisplayToggle").change(function() {
            $('#pagerDisplay').toggle();
        })
        $("#binDisplayToggle").change(function() {
            $('#binDisplay').toggle();
        })
        $("#address1DisplayToggle").change(function() {
            $('#address1Display, #address2Display').toggle();
        })
            
       // Product Page Tabs / Description / Spec / faq
        $('#myTabs a').click(function(e) {
            e.preventDefault()
            $(this).tab('show');
        });        

        // Product Page Edit Form Master Checkbox 
        $('#edit-formCkBx').change(function() {
            if(this.checked) {
                $(this).closest('.form').children("div").children('input[type=text]').prop( "disabled", false );
            }else{
                $(this).closest('.form').children("div").children('input[type=text]').prop( "disabled", true );
            } 
        });      

        // function to close our popups
        // $('.close-btn, .overlay-bg').click(function(){
        //     $('.overlay-bg, .overlay-content, .overlay-content2').hide();
        //     window.location.reload();
        // });	

    // User Profile page
    }else if (windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/user-profile.aspx') {
//    	isAdmin(currentUser.submitterName);

    // Checkout-Account.aspx
    }else if (windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/Checkout-Account.aspx'){
//    	isAdmin(currentUser.submitterName);

        // Checkout-Account.aspx - Shipping Address same as Account Info? 
        $('#useAsShipping').change(function() {
            var shippingChecked = $(this).is(':checked');

            // if box is checked populate shipping form with Acct info / else zero out form
            if (shippingChecked) {
                $('#shippingFormName').val($("#checkoutFormUserName").val());
                // $('#shippingFormTitle').val(currentUser.userTitle);
                // $('#shippingFormEmail').val(currentUser.submitterEmail);
                // $('#shippingFormPhone').val(currentUser.userPhone);
                // $('#shippingFormFax').val(currentUser.userFax);
                $('#shippingFormAdd1').val($("#checkoutFormUserAdd1").val());
                $('#shippingFormAdd2').val($("#checkoutFormUserAdd2").val());
                $('#shippingFormBin').val($("#checkoutFormUserBin").val());
                // $('#shippingFormDept').val(currentUser.userDept);
            } else {
                var frm = $('#shipping-form');
                frm.find('input').val('');
            }
        });     
        
        // auto populate form fields on checkout
        setTimeout(delayFunction, 500);
        function delayFunction() {                
            $('#checkoutFormUserName').val(currentUser.submitterName);
            $('#checkoutFormUserTitle').val(currentUser.userTitle);
            $('#checkoutFormUserEmail').val(currentUser.submitterEmail);
            $('#checkoutFormUserPhone').val(currentUser.userPhone);
            $('#checkoutFormUserFax').val(currentUser.userFax);
            $('#checkoutFormUserAdd1').val(currentUser.userAdd1);
            $('#checkoutFormUserAdd2').val(currentUser.userAdd2);
            $('#checkoutFormUserDept').val(currentUser.userDept);
            $('#checkoutFormUserBin').val(currentUser.userBin);
            $('#checkoutFormUserBusUnit').val(currentUser.userBusUnit);
            $('#checkoutFormUserAccNum').val(currentUser.userAcctNum);
            $('#billingRCN').val(currentUser.userRCN);
            $('#billingCT').val(currentUser.userCT);
            $('#billingFerc').val(currentUser.userFERCSUB);
            $('#billingActivity').val(currentUser.userActivity);
            $('#billingEWO').val(currentUser.userEWO);
            $('#billingRRCN').val(currentUser.userRRCN);
            $('#billingProject').val(currentUser.userProject);
            $('#billingLocation').val(currentUser.userLocation);
        }

        setTimeout(delayFunction2, 500);
        function delayFunction2() {         
            // cart totals
            // for(var p = 0; p < cartLength; p++ ){
            //     var price = Number(shoppingCart[p].itemPrice);
            //     var quanity = Number(shoppingCart[p].cartQuantity);
            //     cartTotal += (price * quanity);
            // }
            // append cart totals
            
//            $('.checkout-order-total').append("<div class='col-lg-9'># Order(s)</div><div class='col-lg-3'>" + itemsInCart + "</div><div class='col-lg-9'>Shipping:</div><div class='col-lg-3'>$0.00</div><div class='col-lg-9'>Taxes:</div><div class='col-lg-3'>$0.00</div><div class='col-lg-9'>Total:</div><div class='col-lg-3'>$"+ subTotal+"</div>");
            $('.checkout-order-total').append("<div class='col-lg-9'>Total:</div><div class='col-lg-3'>$"+ subTotal+"</div>");
            $('#checkoutTotal').text('$' + subTotal);

        }
    // Admin page  
    }else if (windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/admin2.aspx') {
        getAdminOrders();
    // Thank you page    
    }else if (windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/thank-you.aspx') {
//    	isAdmin(currentUser.submitterName);
        setTimeout(delayFunction3, 500);
        function delayFunction3() {
            $('#orderConfirmName').html(currentUser.submitterName);
        }            
    }else if(windowLocation == 'https://soco365.sharepoint.com/sites/E-Print/Pages/Custom-Product.aspx'){
//    	isAdmin(currentUser.submitterName);
        // Check for FileReader API (HTML5) support.
        if (!window.FileReader) {
            alert('This browser does not support the FileReader API. There for you cannot submit files using the custom order page. Please use the contact us, tab at the bottom left for help with your order. ');
        }
    }

    $( function() {
        $("#datepicker").datepicker();
        $( '.tTip' ).tooltip({
            html:true
        });       
    });    
})});    


/* -------------------------- Change OpCo Logo --------------------------------- */

function opCoLogo(currentUser)
{
	console.log("current user: " + currentUser.submitterName);
	console.log("userOpCo: " +  currentUser.OpCo);
	console.log("changing logo to 'OpCo Logo " + currentUser.OpCo + ".png'");
	
	document.getElementsByClassName("gPLogo")[0].style.backgroundImage = "url('/sites/E-Print/SiteAssets/img/OpCo Logo " + currentUser.OpCo + ".png')";
}

/* ----------------------------  admin button  PDF generator ---------------------------- */

function isAdmin(user){

	switch(user)
	{            
	    case "Lynne H. Tennant": case "Sean McIntyre": case "Topaz Hairston": case "Henry M. Nixon":
	        $('.admin').show();
	        console.log("Admin Check: " + currentUser.submitterName);
	        break;    
	    default:
	        $('.admin').hide();         
	}
}
	
/* ----------------------------  Working PDF generator ---------------------------- */

function genPDFAdmin1(orderNum, productID) {
    //console.log(orderNum + " " + productID);
    var printData = {};
    var dimensions = [];
    var orientation = 'landscape';
    var productType;

    $.ajax({
        url: "../_api/lists/getbytitle('Orders')/getitembyid(" + orderNum + ")",
        type: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function(data) {
            printData.name = data.d.printName;
            printData.title = data.d.printTitle;
            printData.bu = data.d.printBU;            
            printData.dept = data.d.printDept;
            printData.bin =  data.d.printBin;            
            printData.address1 = data.d.printAdd1;
            printData.address2 = data.d.printAd2;            
            printData.phone = data.d.printPhone;
            printData.cell = data.d.printCell;
            printData.fax = data.d.printFax;
            printData.pager = data.d.PrintPager;
            printData.linc = data.d.printLinc;            
            printData.email = data.d.printEmail;            

            productType = data.d.Title;

            // loop through printData 

            for (var key in printData) {
                // if key:value is empty: delete 
                if (printData[key] == null || printData[key] == '' || printData[key] == 'undefined' || printData[key] == 'null') {
                    delete printData[key];
                }
                //else{console.log(key + " -> " + printData[key]);}            
                // 
            }


            for (var key in printData) {
                // if key:value has value add value title for print;
                if (key == 'phone') {
                     printData.phone += ' tel';
                }if(key == 'cell'){
                     printData.cell += ' cell';
                }if(key == 'fax'){
                     printData.fax += ' fax';
                }if(key == 'pager'){
                     printData.pager += ' pager';
                }if(key == 'linc'){
                     printData.linc += ' radio';
                }if(key == 'bin'){
                     printData.bin = 'Bin ' + printData.bin;
                }
            }

            // for (var key in printData) {
            //            console.log('outside ' +key + " -> " + printData[key]);
            // }         
            if (productID == 1 || productID == 2) {
                dimensions = [3.63, 2.19]; // width height with bleed (3.5 x 2 without)
                getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCards.png', createPDF, orientation, dimensions);
            } else if (productID == 3 || productID == 4) {
                orientation = 'landscape';
                dimensions = [6.722, 1.028];
                getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, orientation, dimensions);
            } else if (productID == 5) {
                orientation = 'landscape';
                dimensions = [513, 222.75];
                getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, orientation, dimensions);
            }

        },
        error: function(data) {
            console.log(data);
        }

    });

    var getImageFromUrl = function(url, callback, orientation, dimensions) {
        var img = new Image();

        img.onError = function() {
            alert('Cannot load image: "' + url + '"');
        };
        img.onload = function() {
            callback(img, orientation, dimensions);
        };
        img.src = url;
    }
    
    var createPDF = function(imgData, orientation, dimensions) {
    	var doc = new jsPDF({
            orientation: orientation,
            unit: 'in',
            format: dimensions
        });
        
         doc.addFont("BerninaSans-Semibold", "BerninaSans-Semibold", "normal");
         doc.addFont("BerninaSans-Light", "BerninaSans-Light", "normal");
        
        doc.setTextColor(100, 100, 105);
        doc.setFontSize(7.75);
        doc.setFont("BerninaSans-Light");

        if (productID == 1 || productID == 2) {
            var xCoord = 0.9808; // right
            var yCoord = .537; // down
            for (var key in printData) { // loop object
                if (printData.hasOwnProperty(key)) {
                    if(key == 'name'){

                        doc.text(xCoord, yCoord, '' + printData[key]);                    
                    }else{
                        doc.text(xCoord, yCoord, '' + printData[key]);                    
                    }
                    yCoord = yCoord + .15;
                    if (yCoord > 1.133 && xCoord == 0 ) {
                        yCoord = .537;
                        xCoord = 1.660;
                    }else if(yCoord > 1.7 && xCoord == 1.660){
                        yCoord = yCoord + .15;
                    }
                }
            }
            // letterhead print array on pdf 
        } else if (productID == 3 || productID == 4) {
            var xCoord = 3.363; // right
            var yCoord = 0.167; // down
            for (var key in printData) {
                if (printData.hasOwnProperty(key)) {
                    doc.text(xCoord, yCoord, '' + printData[key]);
                    yCoord = yCoord + .060;
                    if (yCoord > 100) {
                        yCoord = 45;
                        xCoord = 115;
                    }
                }
            }
            // envelopes print array on pdf 
        } else if (productID == 5) {
            var xCoord = 20; // right
            var yCoord = 45; // down
            for (var key in printData) {
                if (printData.hasOwnProperty(key)) {
                    doc.text(xCoord, yCoord, '' + printData[key]);
                    yCoord = yCoord + 10;
                    if (yCoord > 100) {
                        yCoord = 45;
                        xCoord = 115;
                    }
                }
            }
        }

        // coords right then down
        doc.addImage(imgData, 'png', 0, 0, 1.570, .287);

        //graps the div to be printed
        // var string = doc.output('datauristring' );
        // $('#preview-pane').attr('src', string ); 
        doc.save(orderNum + '.' + productType + '.pdf');
    };

}
		
// /* ---------------------------- Test for PDF generator  ---------------------------- */  
// function genPDF(orderNum, productID){
// 	var i;
// 	var pdfArray = shoppingCart;
// 	var dimensions = []; //dimensions for product (card or letterhead)
// 	var orientation;

// 	var getImageFromUrl = function(url, callback, arrayObj, dimensions, orientation  ) {
// 		var img = new Image();

// 		img.onError = function() {
// 			alert('Cannot load image: "'+url+'"');
// 		};
// 		img.onload = function() {
// 			callback(img, arrayObj, dimensions, orientation);
// 		};
// 		img.src = url;
// 	} 
// 	var createPDF = function(imgData, arrayObj, dimensions, orientation ) {
// 		var doc = new jsPDF(orientation, 'pt', dimensions);

// 		doc.addFont("Arial", "Arial", "Regular","Ansi");
// 		// doc.addFont('BerninaSans-Semibold', 'BerninaSans-Semibold', 'normal');
// 		// doc.setFont('BerninaSans-Semibold');
// 		doc.setTextColor(100,100,105);
// 		doc.setFontSize(7);
// 		//remove un-used key : value pairs
// 		delete arrayObj.imageURL		
// 		delete arrayObj.productType;
// 		// delete arrayObj.itemNo;
// 		delete arrayObj.cartQuantity;
// 		delete arrayObj.productTurnAround;
// 		delete arrayObj.orderID;
// 		delete arrayObj.user;
// 		delete arrayObj.itemPrice;

// 		// for (var key in arrayObj) {
// 		// 	// if key:value is empty: delete 
// 		// 	if(arrayObj[key] == null ||arrayObj[key] == "null"){
// 		// 		delete key;
// 		// 	}
// 		// }		
// 		//  business cards print array on pdf
// 		if(arrayObj.productId == 1 || arrayObj.productId == 2 ){
// 			var xCoord = 20; // right
// 			var yCoord = 45; // down
// 			for (var key in arrayObj) {	
// 				delete arrayObj.productId; // do not print productID
// 				if (arrayObj.hasOwnProperty(key)) {		
// 					doc.text(xCoord, yCoord, ''+arrayObj[key] );
// 					yCoord = yCoord + 10;
// 					if(yCoord > 100){
// 						yCoord = 45;
// 						xCoord = 115;
// 					}
// 				}
// 			}
// 		// letterhead print array on pdf	
// 		}else if(arrayObj.productId == 3 || arrayObj.productId == 4 ){
// 			var xCoord = 20; // right
// 			var yCoord = 45; // down
// 			for (var key in arrayObj) {	
// 				delete arrayObj.productId; // do not print productID
// 				if (arrayObj.hasOwnProperty(key)) {		
// 					doc.text(xCoord, yCoord, ''+arrayObj[key] );
// 					yCoord = yCoord + 10;
// 					if(yCoord > 100){
// 						yCoord = 45;
// 						xCoord = 115;
// 					}
// 				}
// 			}
// 		// envelopes print array on pdf	
// 		}else if(arrayObj.productId == 5){
// 			var xCoord = 20; // right
// 			var yCoord = 45; // down
// 			for (var key in arrayObj) {	
// 				delete arrayObj.productId; // do not print productID
// 				if (arrayObj.hasOwnProperty(key)) {		
// 					doc.text(xCoord, yCoord, ''+arrayObj[key] );
// 					yCoord = yCoord + 10;
// 					if(yCoord > 100){
// 						yCoord = 45;
// 						xCoord = 115;
// 					}
// 				}
// 			}
// 		}
// 		// coords right then down
// 		doc.addImage(imgData, 'png', 10, 10, 113, 21  );

// 		//graps the div to be printed
// 		var string = doc.output('datauristring' );
// 		$('#preview-pane').attr('src', string );	
// 	};
	


// 	//loop through shopping cart
// 	for(i = 0; i < cartLength; i++){
		
// 		// find array index of order
// 		if(orderNum == pdfArray[i].orderID){
			
// 			// find product type and create layout 
// 			// business cards standard
// 			if( pdfArray[i].productId == 1 ){
// 				console.log('should be 1 = ' + pdfArray[i].productId );
// 				// loop through product 
// 				for (var key in pdfArray[i]) {
// 					// if key:value is empty: delete 
// 					if(pdfArray[i][key] == null){
// 						delete key;
// 					}
// 					//else{console.log(key + " -> " + pdfArray[i][key]);}	
// 				}
// 				orientation = 'landscape';
// 				dimensions = [204, 123];
// 				getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, pdfArray[i], dimensions, orientation);
// 			}

// 			// business cards executive
// 			else if( pdfArray[i].productId == 2 ){
// 				console.log('should be 2 = ' + pdfArray[i].productId );
// 				for (var key in pdfArray[i]) {
// 					// if key:value is empty: delete 
// 					if(pdfArray[i][key] == null){
// 						delete key;
// 					}
// 					//else{console.log(key + " -> " + pdfArray[i][key]);}						
// 				}	
// 				orientation = 'landscape';
// 				dimensions = [204, 123];
// 				getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, pdfArray[i], dimensions, orientation);							
// 			}

// 			// letterhead standard
// 			else if( pdfArray[i].productId == 3 ){
// 				console.log('should be 3 = ' + pdfArray[i].productId );
// 				for (var key in pdfArray[i]) {
// 					// if key:value is empty: delete 
// 					if(pdfArray[i][key] == null){
// 						delete key;
// 					}
// 					//else{console.log(key + " -> " + pdfArray[i][key]);}						
// 				}	
// 				orientation = 'portrait';
// 				dimensions = [459, 594];
// 				getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, pdfArray[i], dimensions, orientation);			
// 			}

// 			// letterhead executive
// 			else if( pdfArray[i].productId == 4 ){
// 				console.log('should be 4 = ' + pdfArray[i].productId );
// 				for (var key in pdfArray[i]) {
// 					// if key:value is empty: delete 
// 					if(pdfArray[i][key] == null ){
// 						delete key;
// 					}
// 					//else{console.log(key + " -> " + pdfArray[i][key]);}						
// 				}
// 				orientation = 'portrait';
// 				dimensions = [459, 594];
// 				getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, pdfArray[i], dimensions, orientation);									
// 			}		

// 			// envelopes
// 			else if( pdfArray[i].productId == 5 ){
// 				console.log('should be 5 = ' + pdfArray[i].productId );
// 				for (var key in pdfArray[i]) {
// 					// if key:value is empty: delete 
// 					if(pdfArray[i][key] === null  ){
// 						delete key;
// 					}
// 					//else{console.log(key + " -> " + pdfArray[i][key]);}						
// 				} 
// 				orientation = 'landscape';
// 				dimensions = [513, 222.75];
// 				getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF, pdfArray[i], dimensions, orientation);									
// 			}				
// 		}
// 	}

// 	$('.overlay-bg').show(); 
// 	$('.popup').show();

// }  

function orderDetail(orderNum){
	$('.overlay-bg, .popup').show(); 

    $.ajax({
            url: "../_api/lists/getbytitle('Orders')/getitembyid(" + orderNum + ")",
            type: "GET",
            headers: {
                "Accept": "application/json;odata=verbose"
            },
            success: function(data) {
                $('#overlayHeader').append("<div class='cart-header'><div class='col-lg-2'>Client</div><div class='col-lg-4'>Print Information</div><div class='col-lg-2'>Payment Information</div><div class='col-lg-2'>Shipping Information</div><div class='col-lg-2'>Order Notes</div></div>");
                
                // if custom order
                if(data.d.productId == '2112'){
                    $('#overlayBody').append("<div class='admin-order-item clearfix'><div class=col-lg-2><div>"+data.d.client+"</div><div>"+data.d.clientEmail+"</div><div><a class='btn red' download href='"+data.d.customOrderFileUrl+"' >Download File</a></div></div><div class=col-lg-4><div>"+data.d.customName+"</div><div>Output Size: "+data.d.customOutputSize+"</div><div>"+data.d.customColor+"</div><div>Edge: "+data.d.customEdgeOptions+"</div><div>Packaging: "+data.d.customPackaging+"</div><div>Paper Stock: "+data.d.customPaperStock+"</div><div>Paper Type: "+data.d.customPaperType+"</div><div>Print Options: "+data.d.customPrintOptions+"</div><div>Bleed: "+data.d.customBleed+"</div><div>Laminated: "+data.d.customLaminate+"</div><div>Folded: "+data.d.customFold+"</div><div>Binding: "+data.d.customBindingOptions+"</div><div>Tabs: "+data.d.customBindingTabs+"</div><div>Binding Notes: "+data.d.customBindingNotes+"</div><div>Order Notes: "+data.d.customNotes+"</div><div>"+data.d.customDeliveryTime+"</div></div><div class=col-lg-2><div>RCN: "+data.d.RCN+"</div><div>CT: "+data.d.CT+"</div><div>"+data.d.FercSub+"</div><div>"+data.d.Activity+"</div><div>"+data.d.EWO+"</div><div>"+data.d.RRCN+"</div><div>"+data.d.Project+"</div><div>"+data.d.Location+"</div></div><div class=col-lg-2><div>"+data.d.shipName+"</div><div>"+data.d.shipAdd1+"</div><div>"+data.d.shipAdd2+"</div><div>"+data.d.shipBin+"</div></div><div class=col-lg-2><div>"+data.d.notes+"</div></div></div>");
                }else{
                    $('#overlayBody').append("<div class='admin-order-item clearfix'><div class=col-lg-2><div>"+data.d.client+"</div><div>"+data.d.clientEmail+"</div></div><div class=col-lg-4><div>"+data.d.printName+"</div><div>"+data.d.printTitle+"</div><div>"+data.d.printDept+"</div><div>"+data.d.printEmail+"</div><div>Phone:"+data.d.printPhone+"</div><div>Cell: "+data.d.printCell+"</div><div>Fax: "+data.d.printFax+"</div><div>Pager:"+data.d.printPager+"</div><div>"+data.d.printAdd1+"</div><div>"+data.d.printAdd2+"</div><div>Bin: "+data.d.printBin+"</div><div>"+data.d.printBU+"</div><div>Linc: "+data.d.printLinc+"</div></div><div class=col-lg-2><div>RCN: "+data.d.RCN+"</div><div>CT: "+data.d.CT+"</div><div>FercSub: "+data.d.FercSub+"</div><div>Act: "+data.d.Activity+"</div><div>"+data.d.EWO+"</div><div>RRCN: "+data.d.RRCN+"</div><div>Projects: "+data.d.Project+"</div><div>Location: "+data.d.Location+"</div></div><div class=col-lg-2><div>"+data.d.shipName+"</div><div>"+data.d.shipAdd1+"</div><div>"+data.d.shipAdd2+"</div><div>"+data.d.shipBin+"</div></div><div class=col-lg-2><div>"+data.d.notes+"</div></div></div>");
                }
                 
                // printData.name = data.d.printName;
                // printData.title = data.d.printTitle;
                // printData.bu = data.d.printBU;            
                // printData.dept = data.d.printDept;
                // printData.bin =  data.d.printBin;            
                // printData.address1 = data.d.printAdd1;
                // printData.address2 = data.d.printAd2;            
                // printData.phone = data.d.printPhone;
                // printData.cell = data.d.printCell;
                // printData.fax = data.d.printFax;
                // printData.pager = data.d.PrintPager;
                // printData.linc = data.d.printLinc;            
                // printData.email = data.d.printEmail;            

                // productType = data.d.Title;

            },error: function(error) {
                console.log('Error getAdminOrders()');
            }   
    });      
    
}
    // function to close our popups
    $('a.close-btn, .overlay-bg').click(function(){
        $('.overlay-bg, .overlay-content').hide();
        $('#overlayBody, #overlayHeader').html('');
    
    });

// /* ----------------------------  Working PDF generator ---------------------------- */

function genPDFAdmin(orderNum, productID) {
    //console.log(orderNum + " " + productID);
    var printData = {};
    var dimensions = [];
    var orientation = 'landscape';
    var productType;

    $.ajax({
            url: "../_api/lists/getbytitle('Orders')/getitembyid(" + orderNum + ")",
            type: "GET",
            headers: {
                "Accept": "application/json;odata=verbose"
            },
            success: function(data) {
                printData.name = data.d.printName;
                printData.title = data.d.printTitle;
                printData.bu = data.d.printBU;            
                printData.dept = data.d.printDept;
                printData.bin =  data.d.printBin;            
                printData.address1 = data.d.printAdd1;
                printData.address2 = data.d.printAd2;            
                printData.phone = data.d.printPhone;
                printData.cell = data.d.printCell;
                printData.fax = data.d.printFax;
                printData.pager = data.d.PrintPager;
                printData.linc = data.d.printLinc;            
                printData.email = data.d.printEmail;            
                productType = data.d.Title;

                var doc = new jsPDF({orientation: orientation});             
                doc.addFont('SUP.TTF', 'stupid', 'normal', 'Identity-H' );
                // doc.addFont("BerninaSans-Semibold", "stupid", "normal",'Identity-H' );

                doc.setFont('stupid');
                doc.text(10, 20, ['Sup ', {
                    text: 'Sup2'
                    , fontSize: 30
                    , setTextColor: [255, 0, 0]
                    , charSpace: 3
                    , font: 'stupid'
                },' sup3']);
                
                // doc.text(20, 10, 'This is BerninaSans-Semibold normal.');

                doc.setFont("times");
                doc.setFontType("normal");
                doc.text(20, 20, 'This is BerninaSans-Semibold normal but actually is times.');
                doc.save(orderNum + '.' + printData.name + '.pdf');

            },error: function(error) {
                console.log('Error getAdminOrders()');
            }   
    });         
}

// /* ------------------------------ control for button dropdown ------------------------ */ //

$(document.body).on('click','.dropdown-menu li', function(event) {

      var $target = $(event.currentTarget);

      $target.closest('.btn-group')
         .find('[data-bind="label"]').text( $target.text())
            .end()
         .children('.dropdown-toggle').dropdown('toggle');

      return false;

   });

// /* ----------------------------  Not used yet  ---------------------------- */  

// function purchaseHistory() {
//     $.ajax({
	
//         url: "../_api/lists/getbytitle('orders')/items?$filter=client eq '"+currentUser.submitterName+"'",
//         type: "GET",
//         headers: {
//             "accept": "application/json;odata=verbose",
//         },
//         success: function(data) {
//            $.each(data.d.results, function(index, item) {
				
// 				var User = item.User;
// 				// var Status = item.Status;
//                 var ImageURL = item.Image;
// 				var ProductType = item.ProductType;
// 				// var ItemNo = item.Item_x0020_Number;
// 				var Name = item.PrintName;
// 				var Email = item.PrintEmail;
// 				var Number = item.PrintPhone;
// 				var Address1 = item.PrintAddress1;
// 				var Address2 = item.PrintAddress2;
// 				var Price = item.Price;
// 				var Quantity = item.Quantity;
// 				var TurnAround = item.TurnAround;
// 				var Fax = item.PrintFax;
// 				var Pager = item.PrintPager;
// 				var Cell = item.PrintCell;
				
// 				if(CurrentUserName == User){
									
// 					// if(Status == "In-Cart"){
						
// 						$("#shoppingBagItems").append("<div class='cart-item clearfix'><div class='col-lg-6 product-col'><img src='"+ImageURL+"'><div class='item-name'>"+ProductType+"</div><div class='item-content'><div>"+Name+"</div><div>"+Email+"</div><div>"+Number+"</div><div>"+Address1+"</div><div>"+Address2+"</div>	</div></div><div class='col-lg-1 price-col'>"+Price+"</div><div class='col-lg-1 quanity-col txtCenter'>"+Quantity+"</div><div class='col-lg-2 turnaround-col txtCenter'>"+TurnAround+"</div><div class='col-lg-2 edit-cart-col' ><button class='btn white'>Remove Item</button><button class='btn drk-gray'>View</button><button class='btn drk-gray'>Edit</button></div></div>");
//                			//$("#shoppingBagItems").append("<div class='cart-item clearfix'><div class='col-lg-6 product-col'><img src='"+ImageURL+"'><div class='item-name'>"+ProductType+"</div><div class='item-id'>"+ItemNo+"</div><div class='item-content'><div>"+Name+"</div><div>"+Email+"</div><div>"+Number+"</div><div>"+Address1+"</div><div>"+Address2+"</div>	</div></div><div class='col-lg-1 price-col'>"+Price+"</div><div class='col-lg-1 quanity-col'><select><option>"+Quantity+"</option></select></div><div class='col-lg-2 turnaround-col'><select><option>"+TurnAround+"</option></select></div><div class='col-lg-2 edit-cart-col' ><button class='btn white'>Remove Item</button><button class='btn drk-gray'>View</button><button class='btn drk-gray'>Edit</button></div></div>");
// 					// }
										
// 				}			

//             });

//         },
//         error: function(error) {
//         }

//     });
// };


//getImageFromUrl('../_catalogs/masterpage/_ePrintDesigns/img/businessCard700.png', createPDF);


/* ---------------------------- Populate UserEmail on Product page / Called from productUserFormPopulator() ---------------------------- */

// function getAdminOrders() {
//     $.ajax({
//         url: "../_api/lists/getbytitle('Orders')/items?$top=1000",
//         type: "GET",
//         headers: {
//             "accept": "application/json;odata=verbose",
//         },
//         success: function(data) {
//             $.each(data.d.results, function(index, item) {


//                 if (item.turnaround == "Rush") {
//                     $(".turnAroundHigh").append("<div class='admin-order-item clearfix' id='order" + item.Id + "'><div class='col-lg-2'>" + item.Id + "</div><div class='col-lg-2'>" + item.client + "</div><div class='col-lg-2'>" + item.Created + "</div><div class='col-lg-2'><div class='bold brown'>" + item.Title + "</div><div class='red'>" + item.turnaround + "</div></div><div><div class='col-lg-2'><select><option>Processing</option><option>2</option><option>3</option></select><button class='btn gray'>Update Status</button></div><div class='col-lg-2' ><button class='btn brown' onClick='getDigest(genPDFAdmin(" + item.Id + ", " +  item.ProductId + "));return false;'>View File</button><button class='btn red'>Cancel</button></div></div>");
//                 } else if (item.turnaround == "Standard") {
//                     $(".turnAroundStandard").append("<div class='admin-order-item clearfix' id='order" + item.Id + "'><div class='col-lg-2'>" + item.Id + "</div><div class='col-lg-2'>" + item.client + "</div><div class='col-lg-2'>" + item.created + "</div><div class='col-lg-2'><div class='bold brown'>" + item.Title + "</div><div class='red'>" + item.turnaround + "</div></div><div><div class='col-lg-2'><select><option>Processing</option><option>2</option><option>3</option></select><button class='btn gray'>Update Status</button></div><div class='col-lg-2' ><button class='btn brown' onClick='getDigest(genPDFAdmin(" + item.Id + ", " +  item.ProductId + "));return false;'>View File</button><button class='btn red'>Cancel</button></div></div>");
//                 }
//             });
//         },
//         error: function(error) {
//             console.log('Error getAdminOrders()');
//         }
//     });


// }

/* to whomever works this hot mess. I'm sorry. This was caused by :
(1) Lack of a better platform 
(2) Unavailable knowledge of sharepoint app / c#
(3) My inablilty to push back against the PM for scope creep. 
May the Schwartz be with you - SM */