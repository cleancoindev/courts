#!/bin/sh

DAO=$1

echo "Deploying core contract..."
# TODO: Use Perl for consistency
RewardCourts="$(npx aragon deploy RewardCourts | sed -n 's/.* at: \(.*\)/\1/'p)"

echo "Deploying court names contract..."
# TODO: Use Perl for consistency
RewardCourtNames="$(npx aragon deploy RewardCourtNames --init $RewardCourts | sed -n 's/.* at: \(.*\)/\1/'p)"

WRAPPER=$(dao apps $DAO | perl -n -e '/\breward.open@.*?(0x[0-9a-fA-F]*)/ && print $1')
echo "Setting wrapper for this court..."
npx dao exec $DAO $WRAPPER setCourt $RewardCourts $RewardCourtNames 0
