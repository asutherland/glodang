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
*  Andrew Sutherland <asutherland@asutherland.org> (Original Author)
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

noundex.defineLookup("message", "message-id", "string",
                     ["message", "conversation"]);

/**
 * Major changes in logic flow from gloda v1:
 * - Assignment of a message to a conversation happens relatively late.  This is
 *    beneficial because it simplifies shard (and related id) allocation greatly
 *    since we should already have all the inputs required.
 **/

/**
 * Given a MIME representation of an e-mail, we index it.
 */
chewdex.defineRootChewer({
  input: ["raw-message", "mime"],
  output: "message",
  chew: function(fetch, emit, data) {
    var mimemsg = data.mimeMessage;
    var messageId = mm.getOrDie("message-id");
    // this message might already exist...
    var message =
      fetch.namespaceLookup("message", "message-id", "message", messageId);

    // Fetch all the conversations corresponding to messages referenced by this
    //  conversation.
    fetch.namespaceLookup("message", "message-id", "conversation", references);

    // If multiple conversations exist, then figure out if whether this was
    //  an outlook-express-style-induced partition (due to messages with only
    //  one reference) and/or if the user explicitly re-rooted the conversation.
    //  Since each event could in theory happen multiple times, we first want
    //  to lop off everything above the closest explicitly-rooted message and
    //  then see if we still have multiple left, implying partition.

    // We need to merge in the outlook express case, but can just use the
    //  re-rooted conversation as-is

    // if the conversation already existed, acquire a write-lock on it.
    fetch.writeLock(conversation);

    // If the conversation did not exist, create a new locked one with links
    //  from all associated message-id's to the new conversation object.
    fetch.create({
      type: "conversation",
      lookups: [
        ["message", "message-id", references.concat([messageId])],
      ],
      // by virtue of being the first message we know of in the conversation,
      //  we are also the most recent timestamp, which is also important for
      //  sharding
      timestamp: 0,
    });

  }
});
