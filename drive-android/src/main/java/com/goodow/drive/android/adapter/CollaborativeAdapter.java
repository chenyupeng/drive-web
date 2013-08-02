package com.goodow.drive.android.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import com.goodow.android.drive.R;
import com.goodow.drive.android.Interface.IRemoteDataFragment;
import com.goodow.drive.android.toolutils.ToolsFunctionForThisProgect;
import com.goodow.realtime.CollaborativeList;
import com.goodow.realtime.CollaborativeMap;

public class CollaborativeAdapter extends BaseAdapter {
	public static abstract interface OnItemClickListener {
		public abstract void onItemClick(CollaborativeMap file);
	}

	private CollaborativeList folderList;
	private CollaborativeList fileList;
	private LayoutInflater layoutInflater;
	private IRemoteDataFragment fragment;
	private OnItemClickListener onItemClickListener;

	public CollaborativeAdapter(Context context, IRemoteDataFragment fragment,
			CollaborativeList folderList, CollaborativeList fileList,
			OnItemClickListener onItemClickListener) {
		this.folderList = folderList;
		this.fileList = fileList;
		this.fragment = fragment;
		this.layoutInflater = LayoutInflater.from(context);
		this.onItemClickListener = onItemClickListener;
	}

	@Override
	public int getCount() {
		int count = 0;

		do {
			if (null == folderList && null == fileList) {
				break;
			}

			if ((null == fileList || fileList.length() == 0)
					&& null != folderList && folderList.length() != 0) {
				count = folderList.length() + 1;
				break;
			}

			if ((null == folderList || folderList.length() == 0)
					&& null != fileList && fileList.length() != 0) {
				count = fileList.length() + 1;
				break;
			}

			if (folderList.length() != 0 && fileList.length() != 0) {
				count = folderList.length() + fileList.length() + 2;
				break;
			}

		} while (false);

		return count;
	}

	@Override
	public Object getItem(int position) {
		Object object = null;
		do {
			if (null == folderList) {
				break;
			}

			if (position == 0) {
				break;// 分组标题-文件夹
			}

			position = position - 1;

			if (null != folderList && position < folderList.length()) {
				object = folderList.get(position);// 子元素-文件夹
				break;
			}

			if (position == folderList.length()) {
				break;// 分组标题-文件
			}

			if (null != fileList) {
				object = fileList.get(position - 1 - folderList.length());// 子元素-文件
				break;
			}

		} while (false);

		return object;
	}

	@Override
	public long getItemId(int position) {
		return position;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		final CollaborativeMap item = (CollaborativeMap) getItem(position);
		String textViewContentString = "";
		View row = convertView;

		if (0 == position) {
			row = layoutInflater.inflate(R.layout.row_foldergroup, parent,
					false);
			textViewContentString = "文件夹";
		} else if (0 != position && null == item) {
			row = layoutInflater.inflate(R.layout.row_foldergroup, parent,
					false);
			textViewContentString = "文件";
		} else {
			row = layoutInflater
					.inflate(R.layout.row_folderlist, parent, false);

			row.setTag(item);

			ImageView img_left = (ImageView) row.findViewById(R.id.leftImage);
			ImageButton button = (ImageButton) row.findViewById(R.id.delButton);

			if (null != folderList && position < folderList.length() + 1) {
				img_left.setImageResource(R.drawable.ic_type_folder);
				button.setVisibility(View.INVISIBLE);

			} else {
				img_left.setImageResource(ToolsFunctionForThisProgect
						.getFileIconByFileFullName("." + item.get("type")));

				button.setOnClickListener(new OnClickListener() {
					@Override
					public void onClick(View v) {
						onItemClickListener.onItemClick(item);
					}
				});
			}

			textViewContentString = (String) item.get("label");

			fragment.setMapListener(item);
		}

		TextView listItem = (TextView) row.findViewById(R.id.listItem);
		listItem.setText(textViewContentString);

		return row;
	}

	@Override
	public boolean isEnabled(int position) {
		if (null == getItem(position)) {
			return false;
		}

		return super.isEnabled(position);
	}

	/**
	 * @param fileList
	 *            the fileList to set
	 */
	public void setFileList(CollaborativeList fileList) {
		this.fileList = fileList;
	}

	/**
	 * @param folderList
	 *            the folderList to set
	 */
	public void setFolderList(CollaborativeList folderList) {
		this.folderList = folderList;
	}

}
