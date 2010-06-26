/*****************************BEGIN LICENSE BLOCK *****************************
* Version: MPL 1.1/GPL 2.0/LGPL 2.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with the
* License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
* the specific language governing rights and limitations under the License.
*
* The Original Code is Thunderbird Gloda functionality.
*
* The Initial Developer of the Original Code is the Mozilla Foundation.
* Portions created by the Initial Developer are Copyright (C) 2010 the Initial
* Developer. All Rights Reserved.
*
* Contributor(s):
*  Andrew Sutherland <asutherland@asutherland.org>
*
* Alternatively, the contents of this file may be used under the terms of either
* the GNU General Public License Version 2 or later (the "GPL"), or the GNU
* Lesser General Public License Version 2.1 or later (the "LGPL"), in which case
* the provisions of the GPL or the LGPL are applicable instead of those above.
* If you wish to allow use of your version of this file only under the terms of
* either the GPL or the LGPL, and not to allow others to use your version of
* this file under the terms of the MPL, indicate your decision by deleting the
* provisions above and replace them with the notice and other provisions
* required by the GPL or the LGPL. If you do not delete the provisions above, a
* recipient may use your version of this file under the terms of any one of the
* MPL, the GPL or the LGPL.
*
****************************** END LICENSE BLOCK ******************************/

/**
 * Convert flickr links to image info.  Based on Raindrop code.
 */

var INFO_API_URL = "http://api.flickr.com/services/rest/";

chewdex.registerUrlHandlers([
  {
    domain: "flickr.com",
    pathPart: "photos",
  },
  {
    domain: "flic.kr",
  },
], {
  chew: function(fetch, emit, url) {
    var idstr = (url.domain == "flickr.com") ?
                 url.getPathPart(2) : url.path;
    try {
      var obj = fetch.jsonUrl(GDATA_API_URL.replace("%s", hash));
      // - Things we want for the display:
      // canonical url:
      // image stuff: thumbnail url, full image url
      // description stuff: title, description
      // who posted the picture: ... more complex

      // - Identity resolution
      // We immediately know: user id, handle, and real name.
      // From user id/handle we can get e-mail sha1 hash via a request.
      // With the sha1 hash, we can see if the contact is already known to us and
      //  merge the identity in as appropriate.
      // If the contact is not known to us, create a new one with the identity.
      

    }
    catch (ex) {
      throw new Error("Implement 404 handling...");
    }
  },
});

// http://www.flickr.com/services/api/misc.urls.html
var BASE58_ALPHABET =
  "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

function base58Decode(s) {

}
