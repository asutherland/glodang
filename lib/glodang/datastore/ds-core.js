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
 * ## Key datastore concepts:
 *
 * - Lookup Namespace: A lookup from arbitrary string id's to object
 *    identifiers.  Each namespace is explicitly associated with a noun type.
 *    For example, you would have a namespace mapping e-mail addresses to their
 *    identity objects.  You might also have a mapping from sha1 hashes of
 *    e-mail addresses to their identity objects.
 *
 * - View Slice: A pre-computed total ordering on a sub-set of records intended
 *    to allow the UI to efficiently present a window into that total ordering
 *    without having to load every record in the sub-set.  This basically
 *    amounts to an index that may have additional data nuggets from records
 *    because the UI needs them to present the entire value space to the user
 *    without needing to fetch records.  The primacy of UI cannot be undersold
 *    here; we do not want to compute things that will never be used and we can
 *    thereby afford to spend more on those things which can and will be used.
 *
 * - Data Importance: Not all data is created equal.  We recognize the following
 *    types of data importance:
 *   - User Explicit: Mutating actions taken by the user.  The user starring
 *      a message or tagging it is such an example.
 *   - User Implicit: Inferences made by observing the user.
 *   - Definitive source: This is the original copy; if it goes away, it's
 *      possible the data is gone forever.  POP mail only stored in our data
 *      store and not also available from mailnews legacy stores would be an
 *      example.
 *   - Inaccesible source: This is not the original copy; if it goes away, we
 *      can get another copy, but it would require user interaction on our
 *      behalf.  For example, a primarily offline device would need to ask to
 *      be given network access, or have a backup tape inserted or something.
 *      This one is not tremendously likely and probably should just reduce to
 *      "definitive source but if we create backup software maybe don't backup".
 *   - Accessible {Expensive,Cheap} source: This is not the original copy and
 *      we can re-get the data.  An example of an expensive accessible source
 *      would be a data source that involves scraping a website; that takes a
 *      lot of effort to do and has to be done slowly so as to not be a jerk
 *      or what not.  IMAP (ignoring mailnews legacy stores) would be
 *      accessible cheap.  In theory expensive metered bandwidth could be
 *      'upgraded' to expensive, but it's unlikely this mechanism would be used
 *      for that.  Twitter would also be accessible cheap unless timelines start
 *      having horizons like search.
 *   - External source: The data is coming from some system that is bolted onto
 *      glodang and just wants glodang for its awesome feature superpowers but
 *      does not need glodang to take on responsibility for the continued
 *      existence of any of the data.  The external source can reproduce all the
 *      data it has ever provided (and is still asserted to exist) at the drop
 *      of a hat.  All mailnews legacy stores that are available offline are
 *      examples of external sources.  People could also add highly available
 *      network services as external sources, although those are likely to just
 *      be trouble.
 *   - Derived [Un]Stable {Expensive,Cheap}: The data can be entirely computed
 *      from the above types of data.  Expensive data takes a lot of computation
 *      work so should not be thrown away lightly.  Unstable derived data means
 *      that if we recomputed the data again in the future, we might get a
 *      different answer, usually because of a dependence on an outside source
 *      of data that may be the result of other processed messages.  For
 *      example, automated classification of messages (bayesian/LSI/LDA/etc.)
 *      might produce different results if recomputed from scratch.
 *
 * ## Implementation key details:
 *
 * - We persist all noun/schema information to the database.  Because our schema
 *    is very 'soft' and defined by the currently loaded extensions, it's
 *    important to be able to know what an extension was up to once it is no
 *    longer there or what it used to do before it got updated to a new
 *    release.
 *
 * - Distill permutations of extension configurations to strictly increasing
 *    revision numbers.  This includes changes to extension logic as well as
 *    changes to their configurations.  Shards can then track the state of the
 *    records they contain.  Ideally this reduces to just the single revision
 *    number, but while reindexing (or consideration of reindexing; some shards
 *    may be entirely unaffected by configuration changes) is in process, it
 *    is possible for a more complex representation to be in use.
 *
 * - Allow for columns on records that store raw source data as well as derived
 *    expensive data which is not a final output but is an input to things which
 *    are.
 */
