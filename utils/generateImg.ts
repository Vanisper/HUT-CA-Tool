/**
 * 将页面指定节点内容转为图片
 * 1.拿到想要转换为图片的内容节点DOM；
 * 2.转换，拿到转换后的canvas
 * 3.转换为图片
 */
import html2canvas from "html2canvas";

export function htmlToCanvas(
  el: HTMLElement,
  backgroundColor = "rgba(0,0,0,.1)"
) {
  return new Promise(async (resolve, reject) => {
    try {
      const markImg = await html2canvas(el, {
        scale: 2,
        allowTaint: false, //允许污染
        useCORS: true,
        // backgroundColor, //'transparent'  //背景色
      });
      resolve(markImg);
    } catch (error) {
      reject(error);
    }
  });
}
