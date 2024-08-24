const HowItWorks = () => {
  return (
    <>
      <div className="flex flex-col gap-5 p-5">
        <div className="text-primary text-3xl font-semibold">How It Works</div>
        <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
          <p className="text-lg font-medium">
            All players helping with our inaugural season will have a chance to win $200. Enter this wager league, and whoever has the highest balance after week 8 will receive $200.
          </p>
          <p className="text-lg font-semibold">Here's how it works:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Register as a player and you will receive 3000 as your initial balance.</li>
            <li>Use your balance to place wagers.</li>
            <li>For $10, you can receive another 3000 in your initial balance. Total initial balance will be 6000.</li>
            <li>Once your whole balance is lost, you can rebuy for $40. After rebuy, your balance will be refilled with 30000.</li>
          </ul>
          <p className="text-lg">
            This is a wagering league. All players use their balance to wager in weekly NFL games. You can wager in straight, parlay, or teaser wagers. Spreads are released on Tuesdays before 6pm. These spreads do not adjust during the week until Friday. The spreads will be adjusted one time at 8pm Central time on Fridays. Then these spreads will remain the same until gametime. All spreads will be based on Las Vegas oddsmakers.
          </p>
          <p className="text-lg font-semibold">
            All buyins will be awarded in the prize structure. There are no fees in this wagering league or service.
          </p>
          <p className="text-lg">
            The player with the highest balance on October 29th will win $200.
          </p>
          <p className="text-lg">
            A running total of all the buyins will be recorded on the home page for all players and visitors to see. For example:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>11 initial buyins of $10 totaling $110</li>
            <li>8 rebuys of $40 totaling $320</li>
          </ul>
          <p className="text-lg">
            Total prize pool is $430.
          </p>
          <p className="text-lg font-semibold">
            GoatSportspools will also add to the final prize pool of at least $100.
          </p>
          <p className="text-lg">
            In the scenario above, the highest balance at the end of the NFL season will win $430. The second-highest balance will win $100.
          </p>
          <p className="text-lg font-semibold">
            Prize structure will be announced after the second week of the NFL season. September 19th, 2024.
          </p>
        </div>
      </div>
    </>
  );
}

export default HowItWorks;