const all_message =
  "  one guy two guy three four five guy six guy  and seven guy, eight   guy nine guy ten guy\nfor guy, " +
  "before you go, make sure you don't speak too quick alright? goodnight!  forget about it. " +
  "you boys be aight.\nwe make big cookie for to bring customer back. foursome at the forefront. " +
  "none of that fluff. i know no fear \n come at me bro. can't you see why you are a goob? " +
  "they've gotta go? YOU ARE WHY you are why yOu aRe whY You Are Why\n\nTHEY've I'VE who'VE you'Ve we'vE " +
  "alrIGHT alRiGhT alRIght. NOT THE BEES. speedy fast boi. I'm not your mate, matey." +
  "þat sucks.   reeeeaaaiiiiiiuiiiiglloooooyyyyy  ";

export const OPTIMIZE_LEVEL_TESTS = [
  {
    input: all_message,
    level: "safe",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy\nfor guy," +
      "before you go,make sure you don't speak2quick alrite?goodnite!forget about it. " +
      "you boysⓑaite.\nwe make big cookie for to bring cuﬆomer back. foursome@ þe forefront. " +
      "none of þat ﬂuff. ⓘknow № fear\ncome@me bro. can't you see why you are a goob? " +
      "þey've gotta go?YOU ARE WHY you are why yOu aRe whY You Are Why\nÞEY've I'VE who'VE you'Ve we'vE " +
      "alrITE alRiTe alRIte. NOT ÞE B'S. speedy faﬆ boi. I'm not your mate,matey. " +
      "þat sucks. reeaaiiuiigllooyy",
  },
  {
    input: all_message,
    level: "normal",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy\nfor guy," +
      "b4ⓤgo,make sureⓤdon't speak2quick alrite?goodnite!forget about it. " +
      "ⓤboysⓑaite.\nwe make big cookie for to bring cuﬆomer back. foursome@ þe forefront. " +
      "nun of þat ﬂuff. ⓘ № № fear\ncome@me bro. can'tⓤⓒⓨⓤⓡa goob? " +
      "þeyve gotta go?ⓊⓇⓎⓤⓡⓨⓤⓡⓨⓊⓇⓎ\nÞEYve IVE whoVE youVe wevE " +
      "alrITE alRiTe alRIte. NOT ÞE B'S. speeⓓfaﬆ boi. I'm not your 􃎜8, 􃎜80. " +
      "þat sucks. reeaaiiuiigllooyy",
  },
  {
    input: all_message,
    level: "max",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy\n4guy," +
      "b4ⓤgo,make sureⓤdon't speak2quick alrite?goodnite! 4get about it. " +
      "ⓤboysⓑaite.\nwe make big cookie4 2bring cuﬆomer back. 4some@ þe4front. " +
      "nun of þat ﬂuff. ⓘ № № fear\ncome@me bro. can'tⓤⓒⓨⓤⓡⓐgoob? " +
      "þeyve gotta go?ⓊⓇⓎⓤⓡⓨⓤⓡⓨⓊⓇⓎ\nÞEYve IVE whoVE youVe wevE " +
      "alrITE alRiTe alRIte. NOT ÞE B'S. speeⓓfaﬆ boi. I'm not your 􃎜8, 􃎜80. " +
      "þat sucks. reeaaiiuiigllooyy",
  },
];
