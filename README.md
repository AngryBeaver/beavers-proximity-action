# Beaver's Gamepads
![Foundry Core Compatible Version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fgithub.com%2FAngryBeaver%2Fbeavers-proximity-action%2Freleases%2Flatest%2Fdownload%2Fmodule.json)
![Foundry System](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fsystem%3FnameType%3Draw%26showVersion%3D1%26style%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FAngryBeaver%2Fbeavers-proximity-action%2Fmain%2Fmodule.json)
![Download Count](https://img.shields.io/github/downloads/AngryBeaver/beavers-proximity-action/total?color=bright-green)

## Description
This Module lets you interact with activities in proximity range of your actor token.

In the first version I only have implemented one Activity: "Secret-Doors". 

It is originally designed for my local campaign where users do not have an own client but running around via gamepads.
With this I hope to bring some more automated interactions to the table.

## Included Activities
### Secret-Door Activity
This will allow users to search for secret doors and when they succeed make the secret door a normal door.

## Configure Activities
### global Settings
A gm can configure the global behaviour of an activity.
#### TestOptions
- skillCheck
  ![img.png](pictures/testOption.png)
- abilityCheck
  
  (not available for all system depends on bsa-implementation)
- gm prompt
  
  (will pop a question on gm client )
- userInput

  ask the user for some input e.g. password to open a door
- Success

## Notes
In order for this module to work a gm has to be connected.

## How to build your own Activities.
This module is intended to be extended, however the documentation about how to do it will come later.
The structure might change too much in the early versions to make it stable usable for others.

## TODO 1.0.0
- make Scan Area Settings
- add activities to tiles / walls
- rework global/scene Settings set default activities on tiles/walls 
- allow generic macro test
- allow generic macro execution
- allow generic macro isAvailable
- add gamepad ui module
  - shortcut activity gamepad module


## Feature Plan
- Locked-Door-Activity
  - to open locked doors.
- Activity ui layer
  - A gm view to show existing activityResults
  - delete existing activityResults ( needed for interaction types )
- Basic GridActivities.
  - add to the ui layer the ability to drop Locations for GridActivities
  - delete Locations for GridActivities.
  - basic configuration of GridActivities.
  - global configuration of GridActivities.
- Find-Clue-Activity
  - an Activity to investigate a Location and returning some clues
- Loot-Activity
  - dropping loot on the canvas will transform it to a Location spot
  - or interact somehow with item-piles ?
- Basic TokenActivities.
  - asign activities to actors
  - detect tokens with activities on actor in proximity range.
- Extend Documentation.
  - how to build your own Activities.

-------------------
Activities
- namedChecks
  - must define namedChecks.
  - can configure namedChecks "skill arcana: default 10" global Settings
- actions
  - can define actions for those namedChecks
  - allows actions to be registered for those named checks. (hooks)
  - can be configured to be enabled by default. (global Setting)
  - can be configured to have fallback action -> is an Action that triggers when no namedCheck is successfull.

Actions belong to an Activity and can be configured.
- actions do not know anything about the namedChecks they run upon.
- actions can define configuration fields needed for its action.
- actions must define a success execution method.
- actions can define a fail execution method.

Tiles/walls/token 
- can add Actions grouped by activities
  - can configure each configuration field.
  - can be configured to be an individualSubCheck
    - name and icon needed
    - when a user selects a namedCheck he will get all Actions for it found and if there are mutliple subChecks the user will get a choice.
  - can add a namedCheck from the available
    - can configure success/failure for that namedCheck.


Users select namedChecks not Activities nor Actions
namedChecks can trigger Actions.
ForEach namedCheck Actions are triggered in priority order.

Are namedChecks unique to an Activity ? or can different Activities share a namedCheck.
e.g. "search" -> find traps and loot ?
kiss: version 1 assumption namedChecks can not be shared.

Examples
Activity RevealSecretDoors
"search Secret Door" -> namedCheck. "skill perception"
"cast detect secretDoor" -> namedCheck. "ask gm or hit"
Action nothing -> success, fail => nothing
Action found -> success "make door out of wall".


iterate over all tiles ->
-> get all ConfiguredActions
-> order them by priority
when no Action is successful -> trigger Fallback.

Special only one action per wall allowed it does not make sense to add more.
Special action needs to be found on all Walls.
Special fallback when no tile has a wall.


Examples
Activity DetectClues
"Investigate Footprint" -namedCheck "skill perception"
"Investigate Table" -namedCheck "skill perception"

Special The user selects the activity "investigate"
Special subchoice search table, search footstep 


No order needed

do we need activities
-> do we need multiple namedChecks per activity ?
-> do we need multiple actions per activity ?




