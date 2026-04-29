# Playtest checklist

Run this checklist before merging gameplay or refactor changes.

## Boot
- [ ] Page loads without a blank screen
- [ ] No obvious console/runtime errors
- [ ] Splash screen appears
- [ ] First input advances to title

## Audio
- [ ] Title music starts after first user gesture
- [ ] Battle music starts in combat
- [ ] Ambient wind returns outside combat
- [ ] SFX still play where expected

## Movement / world
- [ ] Player can move in all four directions
- [ ] Running still works
- [ ] Flying still works
- [ ] Collisions still block correctly
- [ ] Level transition still works at map edge
- [ ] Camera tracks correctly

## Interaction
- [ ] `Z` interacts with the tile in front of the player
- [ ] Ground items still work
- [ ] Chests still work
- [ ] Enemy contact/dialogue/combat still work

## Combat
- [ ] Combat overlay appears
- [ ] Player can choose actions
- [ ] Wait countdown advances
- [ ] Damage/heal/copy resolution still works
- [ ] Combat exits cleanly

## Inventory / UI
- [ ] `X` opens inventory
- [ ] Inventory selection moves correctly
- [ ] Save overlay opens with Shift
- [ ] Dialogue/chest UI still render correctly

## Save/load
- [ ] Saving to a slot succeeds
- [ ] Reloading from title restores level and position
- [ ] Inventory/opened entities persistence still works

## Structure guardrails
- [ ] `index.html` script order matches architecture docs
- [ ] All referenced `src/*.js` files load successfully
