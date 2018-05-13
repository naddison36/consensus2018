
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

contract StructTesting {

    struct Simple {
        string name;
        bool init;
        // mapping (address => Nest) nested;
        // Nest[] nested;
        Nest nested;
    }

    struct Nest {
        bool init;
    }

    Simple[] simples;

    function save(Simple simple) public
    {
        simples.push(simple);
    }

}