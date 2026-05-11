export type Temp = "cold" | "hot";

export interface MenuItem {
  name: string;
  temps: Temp[];
  note?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const MENU: MenuGroup[] = [
  {
    title: "Cà phê",
    items: [
      { name: "Cafe đen", temps: ["cold", "hot"] },
      { name: "Cafe sữa (nâu)", temps: ["cold", "hot"] },
      { name: "Bạc xỉu", temps: ["cold", "hot"] },
      { name: "Cafe muối", temps: ["cold"] },
      { name: "Cold Brew cam", temps: ["cold"] },
      { name: "Cold Brew mơ", temps: ["cold"] },
    ],
  },
  {
    title: "Trà sữa",
    items: [
      { name: "Hồng trà sữa", temps: ["cold", "hot"] },
      { name: "Trà sữa nhài", temps: ["cold", "hot"] },
      { name: "Trà sữa ô long", temps: ["cold", "hot"] },
      { name: "Lục trà sữa", temps: ["cold", "hot"] },
    ],
  },
  {
    title: "Matcha",
    items: [
      { name: "Matcha latte", temps: ["cold", "hot"] },
      { name: "Trà sữa matcha", temps: ["cold"] },
      { name: "Coconut Matcha", temps: ["cold"] },
      { name: "Matcha Macchiato", temps: ["cold"] },
    ],
  },
  {
    title: "Trà trái cây",
    items: [
      { name: "Trà ổi hồng", temps: ["cold"] },
      { name: "Trà măng cầu", temps: ["cold"] },
      { name: "Trà xoài chanh leo", temps: ["cold"] },
      { name: "Trà cam đào", temps: ["cold"] },
      { name: "Trà kiwi lá nếp", temps: ["cold"] },
      { name: "Trà tắc / chanh mật ong", temps: ["cold"] },
      { name: "Trà Xum Xuê", temps: ["cold"], note: "Base vị dưa lưới" },
    ],
  },
  {
    title: "Trà thảo dược",
    items: [
      { name: "Trà chanh gừng mật ong", temps: ["hot"] },
      { name: "Trà thảo mộc", temps: ["hot"] },
      { name: "Trà hoa", temps: ["hot"], note: "Sen, cúc, táo đỏ..." },
    ],
  },
  {
    title: "Topping",
    items: [
      { name: "Trân châu trắng", temps: [] },
      { name: "Trân châu đen", temps: [] },
      { name: "Nha đam", temps: [] },
      { name: "Thạch dừa", temps: [] },
    ],
  },
];
