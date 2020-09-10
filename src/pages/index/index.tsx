import * as React from 'react';
import { View,Image,Text } from 'remax/one';
import styles from './index.css';
import { usePageEvent } from 'remax/macro';
import {useState} from "react";
import classNames from 'classnames';

interface TangGuo{
    url:string;
    type:number;
    row:number;
    col:number;
    key:string;
    remove?:boolean;
}

export default () => {
  const [height,setHeight] = useState<number>(0);
  const [width,setWidth] = useState<number>(0);
  const [rows,setRows] = useState<number>(4);
  const [cols,setCols] = useState<number>(4);
  const [current,setCurrent] = useState<TangGuo | null>();
  const [prev,setPrev] = useState<TangGuo | null>();
  const [tangguos,setTangguos] = useState<TangGuo[]>([]);
  const [tangguoMap,setTangguoMap] = useState<{[key:string]:TangGuo}>({});

  usePageEvent('onLoad', () => {
      const max = 12;
      const min = 6;
      const tangguos1 = [];
      // 初始化糖果信息
      for (let row=0;row<rows;row+=1){
        for (let col=0;col<cols;col+=1){
            const type = Math.floor(Math.random()*(max-min+1)+min);
            const tangGuo = {
                url:'https://bootx-xxl.oss-cn-hangzhou.aliyuncs.com/img/tangguo/icon_'+type+".png",
                type,
                row,
                col,
                key:`${row}_${col}`,
            };
            tangguoMap[`${row}_${col}`] = tangGuo;
            tangguos1.push(tangGuo);
        }
      }
      setTangguoMap(tangguoMap);
      setTangguos(tangguos1);

    wx.getSystemInfo({
      success:result=>{
        setHeight(result.windowHeight);
        setWidth(result.windowWidth);
      }
    })
  });

    /**
     * 从这两个周围开始扩散找到连续的三个或三个以上进行消除。
     * @param item1
     * @param item2
     */
  const remove=(item1:TangGuo,item2:TangGuo)=>{
        const {row:currentRow,col:currentCol,url:currentUrl,type:currentType} = item2;
        const {row:prevRow,col:prevCol,url:prevUrl,type:prevType} = item1;
        // 先消除周围
        getRemoveItem(item2);
        // 再铺满期满
        fillup();
        // 清理全盘
        removeAll();
  }

  const getRemoveItem=(item:TangGuo)=>{
      let isRemove = false;
      const rowTangGuos = [...getRemoveLeftItem(item),item,...getRemoveRightItem(item)];
      const colTangGuos = [...getRemoveTopItem(item),item,...getRemoveBottomItem(item)];
      console.log(item,rowTangGuos,colTangGuos);
      // 只要有一个长度达到了3，就可以消除了。
      if(rowTangGuos.length>=3){
          isRemove = true;
          rowTangGuos.forEach(item=>tangguoMap[`${item.row}_${item.col}`].remove=true)
      }
      if(colTangGuos.length>=3){
          colTangGuos.forEach(item=>tangguoMap[`${item.row}_${item.col}`].remove=true)
      }

      console.log(tangguoMap);

      return isRemove;
  }

    const getRemoveLeftItem=(item:TangGuo)=>{
        const leftTangGuos = [];
        const {row,col,type} = item;
        for (let start=row-1;start>=0;start-=1){
            const leftTangGuo = tangguoMap[`${start}_${col}`];
            if(leftTangGuo.type===type){
                leftTangGuos.push(leftTangGuo);
            }else{
                break
            }
        }
        return leftTangGuos;
    }

    const getRemoveRightItem=(item:TangGuo)=>{
        const rightTangGuos = [];
        const {row,col,type} = item;
        for (let start=row+1;start<rows;start+=1){
            const rightTangGuo = tangguoMap[`${start}_${col}`];
            if(rightTangGuo.type===type){
                rightTangGuos.push(rightTangGuo);
            }else{
                break
            }
        }
        return rightTangGuos;
    }

    const getRemoveTopItem=(item:TangGuo)=>{
        const topTangGuos = [];
        const {row,col,type} = item;
        for (let start=col-1;start>=0;start-=1){
            const topGangGuo = tangguoMap[`${row}_${start}`];
            if(topGangGuo.type===type){
                topTangGuos.push(topGangGuo);
            }else{
                break
            }
        }
        return topTangGuos;
    }

    const getRemoveBottomItem=(item:TangGuo)=>{
        const bottomTangGuos = [];
        const {row,col,type} = item;
        for (let start=col+1;start<cols;start+=1){
            const bottomTangGuo = tangguoMap[`${row}_${start}`];
            if(bottomTangGuo.type===type){
                bottomTangGuos.push(bottomTangGuo);
            }else{
                break
            }
        }

        return bottomTangGuos;
    }



  const fillup=()=>{

    }

    const removeAll=()=>{

    }


  const swap=(item1:TangGuo,item2:TangGuo)=>{
      // 当前点击的是第row行，col列项，
      if(item1&&item2){
          const {row:currentRow,col:currentCol,url:currentUrl,type:currentType} = item2;
          const {row:prevRow,col:prevCol,url:prevUrl,type:prevType} = item1;
          if((Math.abs(currentRow-prevRow)==1&&Math.abs(currentCol-prevCol)==0)||(Math.abs(currentRow-prevRow)==0&&Math.abs(currentCol-prevCol)==1)){
              const newTangGuos = [...tangguos];
              let prevTangGuo = newTangGuos.filter(item=>item.key===item1.key)[0];
              let currentTangGuo = newTangGuos.filter(item=>item.key===item2.key)[0];
              prevTangGuo.url = currentUrl;
              prevTangGuo.type = currentType;
              currentTangGuo.url = prevUrl;
              currentTangGuo.type = prevType;
              setTangguos(newTangGuos);
              // 增加消除的逻辑。
              remove(item1,item2);
              return true;
          }
      }
      return false;
  }

  const handTap=(item:TangGuo)=>{
      const flag = current&&swap(current,item);
      if(flag){
          setPrev(null);
          setCurrent(null);
      }else{
          setPrev(current);
          setCurrent(item);
      }
  }
  return (
    <View className={styles.app} style={{height:`${height*2}`}}>
      <View className={styles.top}>ToolBar</View>
      <View className={styles.content} style={{height:`${width*2}`}}>
          {
              tangguos.map((tangGuo)=>(
                  <View key={tangGuo.key} onTap={()=>handTap(tangGuo)} className={current?.key===tangGuo.key ? classNames(styles.item,styles.current):classNames(styles.item)} style={{width:width*2/cols,height:width*2/cols}}>
                      {tangGuo.type}
                    <Image src={tangGuo.url} />
                  </View>
              ))
          }
      </View>
      <View> className={styles.bottom}</View>
    </View>
  );
};
