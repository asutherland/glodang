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


/**
 * Sharding-related logic.
 *
 * Why do we shard?
 *
 * - Fulltext search on a given term is O(matches for that table) and we need
 *    to perform row lookups in order to retrieve any meta-data for the
 *    document.  As such, it is greatly advantageous to segregate documents
 *    by our scoring heuristic so we don't need to perform extra lookups
 *    just to discard documents when we actually search.
 *
 * - To improve locality to leverage optimistic caching/read-aheads on high-seek
 *    cost drives.  If we evict the things we never look at into their own
 *    database, then any read-ahead/caching that happens on the remaining data
 *    (that we are much more likely to look at) is much more likely to be doing
 *    something useful.
 *
 * - To reduce database fragmentation.  SQLite databases fragment and there
 *    isn't a built-in incremental defragmentation mechanism right now (that
 *    improves performance, at least).  By consolidating records with high churn
 *    rates we make it easier to use VACUUM-style behaviour to defragment,
 *    potentially keep the file size small enough that caching diminishes
 *    the impact of fragmentation, and avoid fragmenting unchanging data.
 *
 * - We're hoping it nets us wins if/when we share our data with platforms
 *    that lack storage capabilities for your whole data store, or where you
 *    just don't want all your data for risk reasons.  For example, mobile
 *    devices have limited storage and if you lose yours, you don't want to
 *    risk your old love letters getting out.
 *
 * Key sharding concepts:
 * - Shard: A data subset.
 * - Shard group:
 *
 * We maintain three types of shard groups:
 * - High value: Messages/people/etc. that the user cares about with high
 *    probability, either because we know the user directly cares about the
 *    item, because the item is related to something they care about (messages
 *    written by people they care about, etc.), or because it looks like
 *    something the user will care about (directly to the user from a human).
 * - Low value: Messages/people/etc. that exist and will continue to exist and
 *    we need to know about but in which the user has shown no great interest.
 *    Mailing list messages that will be kept long-term, bulk messages, etc. will
 *    end up in here.
 * - Speculative: Messages/people/etc. that are not long for this world unless
 *    user action saves them.  This is currently intended for speculative
 *    context gathering (tweets from timelines the user is not subscribed to,
 *    temporary twitter searches) or for data spelunking (mailing list
 *    investigations).
 *
 *
 */

var GROUP_HIGH_VALUE = 1;
var GROUP_LOW_VALUE = 2;
var GROUP_SPECULATIVE = 3;

/**
 * Propagate importance to this item from higher value shard groups.
 */
var PROPAGATE_NORMAL = 2;

/**
 * Firewall propagation of importance to this item or its nested items from
 *  higher value shard groups.  This is intended to be used in speculative shard
 *  groups to avoid accidentally sucking up every message a contact of yours has
 *  sent to a mailing list you are just spelunking through.
 */
var PROPAGATE_FIREWALL = 3;

const SHARD_BLOCK_SIZE = 1024;

function ShardBlock() {
  this.blockStart = 0;
  this.mutationCount = 0;
  this.dateStart = 0;
  this.dateEnd = 0;
}
Shard.prototype = {

};

/**
 * The shard migrator migrates:
 * - Individual records from one shard to another when a record needs to be
 *    promoted based on importance rules.
 * - The contents of entire shards from one shard group to another.  For example,
 *    when a recent high-churn time-based shard group needs to be folded into a
 *    low-churn catch-all shard group.
 * - Filtered contents of shards in a speculative shard group to a
 *    non-speculative shard group.
 */
var ShardMigrator = {


};
