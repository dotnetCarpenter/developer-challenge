Game Company Analyse (GameIsland?)
==================================

> Bo Stendal Sørensen citat:
> At Ultimate manager we work on making the greatest fantasy football manager of all times.

In previous jobs, a lot of my work con sited of backend development and systems administration, although I worked on frontend development in my spare time and in university projects.
When I applied for the position as frontend developer at Ultimate Manager, I wanted to validate if a frontend position was something for me or not. Although I was happy with the position, I decided that I wanted to move to backend work again in the late spring of 2013.

Achievements:
- Introduced test driven development for the frontend.
- Changed the game (frontend) from a single-team, single-league experience to a multiple-team, multiple-league experience.
- Altered the payments system from a monthly/seasonal discount model to monthly recurring feature-based packages.

> Keywords: Javascript, Backbone.js, Marionette.js, Python, Redis

*Server: nginx/1.3.15*

# Libraries    <sup>name (comment) version - dependencies</sup>

<https://www.ultimatemanager.com/> **Version 2.0.16**

## Landing page <sup>881.103 bytes</sup>

 + Typekit
 + jQuery 1.9.1
 	* jQuery Easing 1.3           - jQuery
 	* iosSlider                   - jQuery
 + Backbone 1.0.0 							- underscore, jQuery
 + underscore
 + Bootstrap
 	* bootstrap-transition 2.3.0  - jQuery
 	* bootstrap-alert 2.3.0       - jQuery
 	* bootstrap-button 2.3.0      - jQuery
 	* bootstrap-carousel 2.3.0    - jQuery
 	* bootstrap-collapse 2.3.0    - jQuery
 	* bootstrap-dropdown 2.3.0    - jQuery
 	* bootstrap-modal 2.3.0       - jQuery
 	* bootstrap-tooltip 2.3.0     - jQuery
 	* bootstrap-popover 2.3.0     - jQuery
 	* bootstrap-scrollspy 2.3.0   - jQuery
 	* bootstrap-tab 2.3.0         - jQuery
 	* bootstrap-typeahead 2.3.0   - jQuery
 	* bootstrap-affix 2.3.0       - jQuery
 + three 57
 + modenizr
 + i18 (GZ?)                    - underscore, jQuery
 + Mixpanel (stats)
 + moment (Date util) 2.0.0

## First game page <sup>(1.999.864 bytes)</sup>

<https://www.ultimatemanager.com/> **Version 2.0.16**

 + inkfilepicker
 + Facebook
 + Mixpanel
 + Zendesk Feedback Tab 2.5
 + Google Analytics
 + TypeKit (not previous TypeKit)
 + swfobject
 + Less.js 1.3.3
 	* ecma-5
 + jQuery 1.7.1
 	* fixedheader 0.1
 	* tablesorter 2.7.6 					- jQuery
 	* customscroll 								- jQuery
 	* iosSlider 1.1.63 						- jQuery
 	* Jcrop 0.9.10 								- jQuery
 	* autogrow 										- jQuery
 	* Multi editable input 				- jQuery
 + underscore 1.4.4
 	* Mentions Input 1.0.2 				- jQuery, underscore
 + Backbone 0.9.10 							- underscore, jQuery
  * Marionette 									- underscore, Backbone
 	* BabySitter 0.0.5 						- underscore, Backbone
 	* Wreqr 0.2.0 								- underscore, Backbone
  * Backbone-relational 0.8.0 	- underscore, Backbone
 + socket.io 0.9.0
 	* tornadio2
 + Kicksend 1.1
 + Bootstrap
 	* bootstrap-tooltip 2.2.2     - jQuery
 	* bootstrap-popover 2.3.1     - jQuery
 	* bootstrap-dropdown 2.3.1    - jQuery
 	* bootstrap-editable 1.4.3    - jQuery
 + moment (Date util) 2.0.0
 + Braintree (credit card payments) 1.1.1
 + Raven (Logging) 1.0.3
 + Le Game 											- Backbone, Marionette, GZ, jQuery
 	*	setup
 	*	i18n
 	*	onVisible
 	*	SocketBindings
 	*	LoadingView
 	*	TypingValidation
 	*	core
 	*	TransactionModel
 	*	CreditCard_002
 	*	Group
 	*	MatchEvent
 	*	MatchEvents
 	*	Match
 	*	SortedMatches
 	*	LeagueRound
 	*	LeagueRounds
 	*	LeagueStatus
 	*	League
 	*	Livefeed
 	*	Manager
 	*	Player
 	*	TeamPlayer
 	*	Players
 	*	TeamPlayers
 	*	RankingItem
 	*	Squad
 	*	Team
 	*	User
 	*	NavigationItem
 	*	Wallpost
 	*	WallpostComment
 	*	PLStanding
 	*	Plan
 	*	SubscriptionExpired_002
 	*	Notification
 	*	Coupon
 	*	Leagues
 	*	Teams
 	*	SortableTableCollection
 	*	Groups
 	*	SortedMatches
 	*	HistoryFeeds
 	*	LiveFeed
 	*	Managers
 	*	JoinedGroups
 	*	Rankings
 	*	GroupRankings
 	*	Squads
 	*	NavigationItems
 	*	Wallposts
 	*	PLStandings_002
 	*	Plans
 	*	PlayerBioRoundStats
 	*	Notifications
 	*	AccountCreditCard
 	*	AccountPlansOverview
 	*	CurrentPlanOverview
 	*	PlanCreditCardOverview
 	*	ProgressBarItem
 	*	ProgressBar
 	*	LeagueSelectorItem
 	*	LeagueSelector
 	*	NotificationListItem
 	*	NotificationListEmpty
 	*	NotificationList
 	*	EditableSection
 	*	TeamSelector
 	*	UserMenu
 	*	TopNavCountdown
 	*	Screen
 	*	Tab
 	*	SimpleContentArea
 	*	ContentArea
 	*	Fixtures
 	*	FormationPicker
 	*	PaginatedTableView
 	*	GlobalRankingTableView
 	*	GroupListItem
 	*	Group_002
 	*	GroupCreate
 	*	GroupsListItem
 	*	GroupsList
 	*	GroupWallPostComment
 	*	GroupWallPost
 	*	GroupWallNoPosts
 	*	GroupWall
 	*	GroupJoinInvitedPopover
 	*	LiveFeedItem
 	*	LiveFeed_002
 	*	MatchScreen
 	*	PitchPlayer
 	*	Pitch
 	*	PlayerBio
 	*	PlayerBioTransferStatRow
 	*	PlayerBioTransferEmpty
 	*	PlayerBioTransfer
 	*	PlayerBioMatch
 	*	SquadPlayers
 	*	SquadSelector
 	*	TeamScreen
 	*	Transfer
 	*	TransferBalance
 	*	TransfersList
 	*	LiveScoreMatchEvent
 	*	LiveScoreMatch
 	*	LiveScoreMatchDay
 	*	LiveScore
 	*	RedeemCoupon
 	*	SetTeamName
 	*	PlansOverview
 	*	CreateUser
 	*	ManagerProfileTeamsItem
 	*	ManagerProfileTeams
 	*	ManagerProfileGroupsItem
 	*	ManagerProfileGroups
 	*	ManagerProfileUser
 	*	ManagerProfile
 	*	NavigationBar
 	*	PLStandings
 	*	CreditCard
 	*	TopNavLayout
 	*	PlayerBioMatchListItem
 	*	PlayerBioMatchList
 	*	Tour
 	*	AccountSettings
 	*	Modal
 	*	init
 	*	Invite
 	*	InviteFriendList
 	*	SubscriptionExpired
 	*	Account
 	*	Loader
 	*	ImageCrop - Jcrop
 	*	TakeWebcamPicture
 	*	TeamSave
 	*	Help
 	*	Announcement
 	*	cookie
 	*	facebook
 	*	match
 	*	modal
 	*	player
 	*	sockets
 	*	track
 	*	ui - GZ, Backbone
 	*	date
 	*	filepicker
 	*	squad
 	*	tours
 	*	router
 	*	kickoff

