/* 

	Genesis.sol
	Consensus2018 Hackathon, NYC
  

	Module Description:
 	
	Producers make claims

	Attestors validate those claims, and update the claim's score
	Scores are out of 100 and the higher the score, the more the Producer's claim can be 'trusted'

	External consumer applications wishes to understand the veracity of a Producer's claim.
	Such apps submit a Producer's ID and the Claim ID and gets back a list of Attestors and their Validations.

*/

pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

contract Genesis {

    // -------------------------------------------------------------
    // STATE DECLARATION
    // -------------------------------------------------------------
 
	mapping( address => Producer ) public producers;
	mapping( address => Attestor ) public attestors;
	
	uint public claimNumber = 1;
	uint public validationNumber = 1;
	
	// -------------------------------------------------------------
    // CONSTRUCTOR
    // -------------------------------------------------------------

	constructor()
	{
			// todo?
	}


    // -------------------------------------------------------------
    // OBJECTS
    // -------------------------------------------------------------

	struct Producer {
		address pubkey;
		string name;
		Claim[] claims;
        bool init;
	}

    struct Claim {
		string description;
		uint numValidations;
		uint rating; // out of 100?
		// mapping( address => Validation ) validations;
    }
	
	struct Attestor {
		address pubkey;
		string name;
		// Validation[] validations;
	}

	struct Validation {
		address owner;
		uint id;
		uint score;
		uint expiry;
	}

    // -------------------------------------------------------------
    // EVENTS
	// -------------------------------------------------------------

	event CreateClaim(address producerAddress, Claim claim, uint length);

    // -------------------------------------------------------------
    // FUNCTIONS
    // -------------------------------------------------------------
 
	function createClaim( address producerAddress, Claim c )
		public
	{
		// require the producer exists
		require(producers[producerAddress].init); 
		
		// set the new claim for the producer
		producers[producerAddress].claims.push(c);

		// Emit the claimID for the new claim
		emit CreateClaim(producerAddress, c, producers[producerAddress].claims.length);
	}


	function validateClaim( address producerAddress, uint claimID, Validation v )
		public
	{
		// ensure scores are within range
		require( v.score >= 0 );
		require( v.score <= 100 );

		// ensure claim exists
		require( producers[producerAddress].claims.length <= claimID );

		// ensure producer exists
		require( producers[producerAddress].init );

		// ensure that the producer is not also the attestor
		require(msg.sender != producerAddress);
		
		// ensure the validation has not already been made within the last 6 months
		// require(producers[producerAddress].claims[claimID].validations[msg.sender].expiry < now);

		// set the validation in the claim
		// producers[producerAddress].claims[claimID].validations[msg.sender] = v;

		// recalculate the claim's rating with the new validation score
		// producers[producerAddress].claims[claimID].rating = 
		// 		(producers[producerAddress].claims[claimID].rating + v.score) / (producers[producerAddress].claims[claimID].numValidations + 1);

		// producers[producerAddress].claims[claimID].numValidations	= producers[producerAddress].claims[claimID].numValidations++;

		// set the expiry for 6 months time
		// producers[producerAddress].claims[claimID].validations[msg.sender].expiry = (now + 26 weeks);
	}


	function createNewProducer( Producer p ) // ABI v2 can pass in a struct
		public
		returns (bool)
	{
		require( producers[p.pubkey].init );
        require( p.pubkey == msg.sender);



		producers[msg.sender] = Producer({
			pubkey: p.pubkey,
			name: p.name,
			claims: p.claims,
			init: true
		}
			
		);
		return true;
	}


    // -------------------------------------------------------------
    // MODIFIERS
    // -------------------------------------------------------------
 



}
