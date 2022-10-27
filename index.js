'use script';
/**
 * The function execuated when click Login button.
 * Help to connect Redis server.
 * If connect successful, jump to rank antion page; otherwise stay in login page
 */
 $("login").onclick = function () {
  let result = getResponse('');
  if ($("login_page").style.display == "block" && result) {
    $("login_page").style.display = "none";
    $("pair_page").style.display = "block";
  } else if($("login_page").style.display){
    $("fail_login").style.display = "contents";
  }
}

/**
 * When click creat button, get parameters from input.
 * After input all parameters, create table with n * n.
 * Otherwise alert.
 */
 $("creat").onclick = function () {
  let userCnt = $("numOfUser").value;
  let groupSize = $("groupSize").value;
  let maxRank = $("maxRank").value;
  let sumRank = $("sumRank").value;
  if (userCnt == "" || groupSize == "" || maxRank == "" || sumRank == "") {
    alert("Please fill out all parameters.");
  }
  else {
    $("pair_page").style.display = "none";
    $("rank_page").style.display = "block";
    let oTable = creatTable(userCnt);
    $("box").appendChild(oTable); 
  }
};

/**
 * When click submit button, store ranking info into redis
 * Each ranking should be in range from 0 to maxRank.
 * All ranking from a user should be sum to sumRank.
 * Otherwise alert and hold.
 */
$("submit").onclick = function () {
  let maxRank = $("maxRank").value;
  let sumRank = $("sumRank").value;
  if (!isValidTable ()) {
    alert("Each ranking should be in a range from 0 to " +  maxRank + ";\n" + 
    "Or for any user, the total ranking should be up to " + sumRank + ".");
  }
  else {
    submit();
    document.getElementById("getResult").disabled = false;
    alert("Successfully submit. please click 'Get Result' to check the group ranking.");
  }
}

/**
 * When click getResult button, get the final ranking result.
 */
 $("getResult").onclick = function () {
  $("rank_page").style.display = "none";
  $("response_page").style.display = "block";
  if ($("table1") === null) {
    alert("Please submit your ranking info.");
  }
  else {
    // window.location.href='findGroupings.html';
    const res = findGroup(getMap());
    let result = 'Total ranking: ' + res[0] + '\n';
    result += 'Group pairing result: ' + '\n';
    for (var i = 0; i < res[1].length; i++) {
      var group = res[1][i];
      result += "Group" + i + ": [ " + group + ' ] \n';
    }
    document.getElementById('response').innerHTML = result;
    console.log(result);
  }
}


/**
 * Shortcut for document.getElementById()
 * @param {*} id 
 * @returns object with id
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Shortcut for document.createElement()
 * @param {*} tagName 
 * @returns object with tagname
 */
function create(tagName) {
  return document.createElement(tagName);
}

/**
 * Get the url which could help connect to redis
 * @param {*} message The command send to redis server
 * @returns url
 */
function setCommand(message) {
  let salt = getRandomString(20);
  let strHash = md5(salt + $('password').value);
  // let strHash = md5(salt + "A9774149D3326"); // Used to simplify test.
  let url = "https://agile.bu.edu/ec500_scripts/redis.php?" + "salt=" + salt + "&hash=" + strHash + "&message=" + message;
  return url;
}

/**
 * Get the responce returned from Redis server
 * @param {*} message The command send to redis server
 * @returns the result from Redis server
 */
function getResponse(message) {
  let xmlHttpReq = new XMLHttpRequest();
  xmlHttpReq.open("GET", setCommand(message), false);
  xmlHttpReq.send(null);
  return xmlHttpReq.responseText;
}


/**
 * Get random characters which used as salt to secure password.
 * @param {*} length The size of charactors
 * @returns A random string
 */
function getRandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Reference: http://www.webtoolkit.info/
 * Password encription
 * @param {*} string Your password
 * @returns A new string which could instead of and secure your password
 */
function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }
  function AddUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x,y,z) { return (x & y) | ((~x) & z); }
  function G(x,y,z) { return (x & z) | (y & (~z)); }
  function H(x,y,z) { return (x ^ y ^ z); }
  function I(x,y,z) { return (y ^ (x | (~z))); }
  function FF(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function GG(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function HH(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function II(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray=Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount-(lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  };
  function WordToHex(lValue) {
    var WordToHexValue='',WordToHexValue_temp='',lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
    }
    return WordToHexValue;
  };
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,'\n');
    var utftext = '';
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };
  var x=Array();
  var k,AA,BB,CC,DD,a,b,c,d;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k=0;k<x.length;k+=16) {
    AA=a; BB=b; CC=c; DD=d;
    a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
    d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
    c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
    b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
    d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
    c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
    b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
    d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
    c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
    b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
    d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
    c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
    b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
    d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
    c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
    b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
    d=GG(d,a,b,c,x[k+10],S22,0x2441453);
    c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
    b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
    d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
    c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
    b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
    d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
    c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
    b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
    d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
    c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
    b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
    d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
    c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
    b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
    d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
    c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
    b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
    d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
    c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
    b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=II(a,b,c,d,x[k+0], S41,0xF4292244);
    d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
    c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
    b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
    d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
    c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
    b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
    d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
    c=II(c,d,a,b,x[k+6], S43,0xA3014314);
    b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
    d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
    c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
    b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=AddUnsigned(a,AA);
    b=AddUnsigned(b,BB);
    c=AddUnsigned(c,CC);
    d=AddUnsigned(d,DD);
  }
  var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
  return temp.toLowerCase();
}


/**
 * Get the matrix of rank info
 * Store the matrix into redis server
 */
function submit() {
  var tables = document.getElementsByTagName("table");
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    tableId = "table" + (i + 1);
    table.setAttribute("id", tableId);

    for (var r = 0, n = table.rows.length; r < n; r++) {
      for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
        table.rows[r].cells[c].setAttribute("id", "cell");
        let cellValue = table.rows[r].cells[c].childNodes[0].value;
        setMatrix(r,c,cellValue);
      }
    }
  }
}

/**
 * Create and show a table on page.
 * @param {*} userCnt Read from page.
 * @returns a table with userCnt * userCnt matrix.
 */
function creatTable(userCnt) {
  var rValue = userCnt;
  var cValue = userCnt;
  var oTable = create("table"); 
  oTable.border = 1;
  var thead = create('thead');
  oTable.appendChild(thead);
  thead.appendChild(create("th")).
  appendChild(document.createTextNode(" " ));
  for (var i =0; i<cValue; i++) {
    thead.appendChild(create("th")).
    appendChild(document.createTextNode("User" + i ));
  }
  for (var i = 0; i < rValue; i++) {
    var oTr = create("tr");
    var text = create('td');
    oTr.appendChild(text.appendChild(document.createTextNode("User" + i )));
    for (var j = 0; j < cValue; j++) {
      var oTd = create('td');
      oTd.classList.add("input");
      var input = create('input');
      input.type = "number";
      input.value = 0;
      if (i == j){
        input.disabled = true;
      }
      oTd.appendChild(input);
      oTr.appendChild(oTd);
    }
    oTr.appendChild(oTd); 
    oTable.appendChild(oTr); 
  }
  return oTable;
}

/**
 * Return true if all rankings or sum of rankings meet the requirments in table.
 * Otherwise return false.
 * @returns 
 */
function isValidTable() {
  var tables = document.getElementsByTagName("table");
  let maxRank = $("maxRank").value;
  let sumRank = $("sumRank").value;
  let sum = 0;
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    tableId = "table" + (i + 1);
    table.setAttribute("id", tableId);

    for (var r = 0, n = table.rows.length; r < n; r++) {
      for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
        table.rows[r].cells[c].setAttribute("id", "cell");
        let cellValue = table.rows[r].cells[c].childNodes[0].value;
        cellValue = +cellValue;
        if (cellValue < 0 || cellValue > maxRank) {
          return false;
        }
        sum = sum + cellValue;
        console.log("r:" + r + ' C:' + c + " cell:" + cellValue +" Sum:" +sum);
      }
      if (sum != sumRank) {
        return false;
      }
      sum = 0;
    }
  }
  return true;
}

/**
 * Store the rank matrix in redis
 * @param {*} r row of matrix
 * @param {*} c colum of matrix
 * @param {*} value value in matrix[row][column]
 */
function setMatrix(r, c, value) {
  let name = "m" + r + c;
  let message = "set " + name + " " + value;
  getResponse(message);
}

/**
 * Get value of matrix[row][column] stores from redis
 * @param {*} r row of matrix
 * @param {*} c colum of matrix
 * @returns Value of matrix[row][column] stores in redis
 */
function getCellValue(r, c) {
  let name = "m" + r + c;
  let message = "get " + name;
  let response =  getResponse(message);
  let cellValue = response.split("Result: ")[1];
  return +cellValue;
}

/**
 * 
 * @param {*} usrList user list
 * @param {*} groupSize maximum group size
 * @returns all permutations from list with a fix group size
 */
function getPermutations(usrList, groupSize) {
  let result = [];
  let perm = new Array();
  dfs(result, usrList, perm, 0, groupSize);
  return result;
}

/**
 * helper of getPermutations()
 */
function dfs(result, usrList, perm, start, groupSize) {
  if (perm.length == groupSize) {
    result.push([...perm]);
    return;
  }
  for (let i = start; i < usrList.length; i++) {
    perm.push(usrList[i]);
    dfs(result, usrList, perm, i + 1, groupSize);
    perm.pop();
  }
}

/**
 * Get sum rank from pairs: 
 * e.g.: 5 users, get the value from pairs(0,1), (0,2), ... (3,4)
 * @returns 
 */
function rankMatrix(){
  const size = $("numOfUser").value;
  let rank_matrix = new Array(size); // create an empty array of length n
  for (var i = 0; i < size; i++) {
    rank_matrix[i] = new Array(size); // make each element an array
  }
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      rank_matrix[i][j] = getCellValue(i, j) + getCellValue(j, i);
    }
  }
  return rank_matrix;
}

/**
 * Create a hashmap with key(permutaions of users)=> value (sum rank of users)
 * @returns map
 */
function getMap() {
  const groupSize = $("groupSize").value;
  let matrix = rankMatrix();
  let usrList = new Array();
  for (let i = 0; i < matrix.length; i++) {
    usrList.push(i);
  }
  let perms = getPermutations(usrList, groupSize);
  let map = new Map();
  for (perm of perms) {
    let sum = getPermSum(perm, matrix);
    map.set(perm, sum);
  }
  return map;
}

/**
 * 
 * @param {*} perm one result of permutaion
 * @param {*} matrix matrix with sum_rank
 * @returns all rank among the users in permutation
 */
function getPermSum(perm, matrix) {
  let twoDList = getPermutations(perm, 2);
  let sum = 0;
  for (pair of twoDList) {
    sum += matrix[pair[0]][pair[1]];
  }
  return sum;
}

/**
 * Get the best combination of seperate groups by using greedy algorithm.
 * @param {*} map with key(all possible combination in groupSize) => value (ranking sum in each combination)
 * @returns Result of groups.
 */
function findGroup(map){
  const size = $("numOfUser").value;
  const groupSize = $("groupSize").value;
  var mapSort = new Map([...map.entries()].sort((a, b) => {return b[1] - a[1]; }));
  let leftCnt = size;
  let gruopNums = size;
  if(groupSize >= 2){
    gruopNums = Math.ceil(size / groupSize + 1)
  }
  let group_result = []
  let delete_set = new Set();
  let total_tank = 0;
  let maxlist = [];
  while (leftCnt >= groupSize){
    let max = 0;
    for (let [key, value] of mapSort){
      console.log('key: ' + key  + "\n");
      var pass = false;
      for( let k of key){
        console.log('k: ' + k + "\n");
        if (delete_set.has(k)){
          pass= true;
          break;
        }
      }
      if(pass == false && value > max){
        max = value;
        maxlist  = key;
      }
    }
    total_tank += max;
    if(maxlist != null && maxlist.length != 0){
      group_result.push([...maxlist]);
      leftCnt = leftCnt - groupSize;
      maxlist.forEach(delete_set.add, delete_set)
      maxlist = []
    }
  }

  if(leftCnt > 0 && leftCnt < groupSize){
    var remain = []
    for(let i = 0; i < size; i++){
      if(!delete_set.has(i)){
        remain.push(i);
      }
    }
    group_result.push([...remain]);
  }

  return [total_tank, group_result];
}
