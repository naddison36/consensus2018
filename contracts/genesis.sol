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
 
	mapping( address => Producer ) 		 public producers;
	mapping( address => Attestor ) 		 public attestors;
	mapping( address => Claim[] ) 		 public claims;
	mapping( address => Validation[10][] ) public validations; // producer => [claimID, validationID]

	// -------------------------------------------------------------
    // CONSTRUCTOR
    // -------------------------------------------------------------

	constructor()
		public
	{
		// todo?
	}


    // -------------------------------------------------------------
    // OBJECTS
    // -------------------------------------------------------------

	struct Producer {
		address pubkey;
		string name;
		bool init;
		//Claim[] claims;
	}

    struct Claim {
		string description;
		uint numValidations;
		uint rating; // out of 100
	//	mapping( address => Validation ) validations;
    }
	
	struct Attestor {
		address pubkey;
		string name;
	//	Validation[] validations;
	}

	struct Validation {
		address owner;
		// uint id;
		uint score;
		uint expiry;
	}

    // -------------------------------------------------------------
    // EVENTS
	// -------------------------------------------------------------

	event CreateClaim(address producer, string claimDescription, uint claimID);
	event CreateValidation(address attestor, address producer, string claimDescription, uint claimID);

    // -------------------------------------------------------------
    // FUNCTIONS
    // -------------------------------------------------------------
 
	
	function createNewAttestor( string name )
		public
	{
		attestors[msg.sender] = Attestor(msg.sender, name);
	}
	
	function createNewProducer( address p, string name ) // ABI v2 can pass in a struct
		public
		returns (bool)
	{
		if( producers[p].init )
			return false;

		producers[msg.sender] = Producer(p,name,true);
		return true;
	}

	function createNewClaim( string claimDescription )
		public
	{
		// require the producer exists
		require(producers[msg.sender].init); 
		
		// set the new claim for the producer

		uint claimID = claims[msg.sender].length + 1;

		claims[msg.sender].push(Claim(claimDescription, 0, 0)); // no need for 'new' keyword?
		// validations[msg.sender].push([]);

		// Emit the claimID for the new claim
		emit CreateClaim(msg.sender, claimDescription, claims[msg.sender].length);
	}


	// Note, this funciton should ideally calculate the valID, but because Nick decided to
	// originally get all tricky with structs which broke a whole bunch of stuff he's gonna
	// have to keep track of the valID's
	function validateClaim( address p, uint claimID, uint score )
		public
	{
		// ensure scores are within range
		require( score >= 0 );
		require( score <= 5 );

		// // ensure claim exists
		require( claims[p].length >= claimID );

		// // ensure producer exists
		require( producers[p].init );

		// // ensure that the producer is not also the attestor
		require( msg.sender != p );
		
		// Basic check to ensure the supplied valID is not out of bounds
		// require( validations[p][claimID].length <= valID );
	
		// ensure the validation has not already been made within the last 6 months
		// require( validations[p][claimID][valID].expiry < now );
		
		/*
			struct Validation {
			address owner;
			uint id;
			uint score;
			uint expiry;
		} */

		// set the validation in the claim
		validations[p][claimID].push(Validation(msg.sender, score, now + 26 weeks));

		// // recalculate the claim's rating with the new validation score
		// claims[p][claimID].rating = 
		// 		(claims[p][claimID].rating + score) / 
		// 		(claims[p][claimID].numValidations + 1);

		// //increment the number of validations for that claim
		// claims[p][claimID].numValidations = 
		// 		claims[p][claimID].numValidations++;

		// emit CreateValidation(msg.sender, p, claims[p][claimID].description, claimID);

	}
	
    // -------------------------------------------------------------
    // MODIFIERS
    // -------------------------------------------------------------


}