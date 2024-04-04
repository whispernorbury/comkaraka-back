const isCSID = (id: string) => {
  const regExpStr: string =
    "^(8[3-9]|9[0-5])27\\d{3}$|" // 83 ~ 95
  + "^9[6-9]31\\d{3}$|" // 96 ~ 99
  + "^0[0-6]4[01]\\d{3}$|" // 00 ~ 06
  // ------------ digit 7 -> 10 --------------
  + "^200[7-8]144\\d{3}$|" // 07 ~ 08
  + "^(2009|201[0-9]|202[01])147[5-6]\\d{2}$|" // 09 ~ 21
  + "^2022148\\d{3}$"; // 22
  const IDFilter: RegExp = RegExp(regExpStr);
  if (id.match(IDFilter)) return true;
  return false;
};

export = isCSID;