//EXAMPLE USAGE:

//ADDING "COSC1P02 DURATION 2" TO pinnedComponents will ensure only D2 combos are generated for COSC1P02
//ADDING "COSC1P02 MAIN 3591102" TO pinnedComponents will ensure only combos with main component (LEC, ASY, etc) with ID of 3591102 will generate for COSC1P02
//ADDING "COSC1P03 TUT 3591103" TO pinnedComponents will ensure only combos with tutorial ID of 3591102 will generate for COSC1P02
//ADDING "COSC1P03 LAB 3591103" TO pinnedComponents will ensure only combos with lab ID of 3591102 will generate for COSC1P02
//ADDING "COSC1P03 SEM 3591103" TO pinnedComponents will ensure only combos with seminar ID of 3591102 will generate for COSC1P02
const pinnedComponents = []; 

export const getPinnedComponents = () => [...pinnedComponents];